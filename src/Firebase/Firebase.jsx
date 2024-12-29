// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Typesense from 'typesense';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Configuração do Typesense
const client = new Typesense.Client({
  nodes: [
    {
      host: import.meta.env.VITE_TYPESENSE_API_HOST,  // Seu host do Typesense (ou da nuvem)
      port: import.meta.env.VITE_TYPESENSE_API_PORT,  // Porta do Typesense
      protocol: import.meta.env.VITE_TYPESENSE_API_PROTOCOL,
    }
  ],
  apiKey: import.meta.env.VITE_TYPESENSE_API_KEY_ADMIN,          // Chave Admin API Key do Typesense
  connectionTimeoutSeconds: 2,
});

// Estrutura da coleção no Typesense
const schema = {
  'name': 'Questoes',
  'fields': [
    { 'name': 'alternativas', 'type': 'string[]' },  // Agora é um array de strings para todas as alternativas
    { 'name': 'alternativaCorreta', 'type': 'int32' }, // Alternativa correta
    { 'name': 'tags', 'type': 'string[]' },  // Array de strings para tags
    { 'name': 'textoBase', 'type': 'string' },  // Texto base da questão
    { 'name': 'tipoProva', 'type': 'string' },  // Tipo de prova (Enade ou POSCOMP)
    { 'name': 'anoProva', 'type': 'int32' },  // Ano da prova
    { 'name': 'numeroQuestao', 'type': 'int32' }  // Número da questão
  ]
};

// Função para buscar as questões do Firestore
async function getQuestionsFromFirestore() {
  const querySnapshot = await getDocs(collection(db, 'Questoes'));
  
  const documents = querySnapshot.docs.map(doc => {

    return {
      alternativas: doc.data().alternativas,  // Array de strings para alternativas
      alternativaCorreta: doc.data().alternativaCorreta,
      tags: doc.data().tags || [], // Certifica-se de que 'tags' seja um array
      textoBase: doc.data().textoBase,
      tipoProva: doc.data().tipoProva,
      anoProva: doc.data().anoProva,
      numeroQuestao: doc.data().numeroQuestao,
      id: doc.id // Inclua o ID do documento como um campo
    };
  });

  return documents;
}

// Função para sincronizar Firestore com Typesense
async function syncFirestoreToTypesense() {

  try {
    // Pega as questões do Firestore
    const documents = await getQuestionsFromFirestore();

    // Verifica se a coleção já existe
    const collections = await client.collections().retrieve();
    const collectionExists = collections.some((col) => col.name === 'Questoes');

    if (!collectionExists) {
      // Cria a coleção 'questoes' se ela não existir
      await client.collections().create(schema);
      console.log('Coleção questoes criada com sucesso.');
    }

    // Envia as questões ao Typesense com upsert
    const result = await client.collections('Questoes').documents().import(documents, { action: 'upsert' });
    console.log('Sincronização completa!', result);
  } catch (error) {
    console.error('Erro ao sincronizar com Typesense:', error.importResults);
  }
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Definindo a persistência local
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Persistência definida com sucesso
  })
  .catch((error) => {
    console.error("Erro ao definir persistência:", error);
  });

export { auth, db, syncFirestoreToTypesense, client };