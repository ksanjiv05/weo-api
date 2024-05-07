import * as fs from "fs";
import { OpenAI } from "langchain/llms/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
import dotenv from "dotenv";
dotenv.config();

const model = new OpenAI({
  modelName: "gpt-3.5-turbo",
});
const baseCompressor = LLMChainExtractor.fromLLM(model);

const text = fs.readFileSync("weo.txt", "utf8");

export const getQueryResponse = async (query: string) => {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([text]);

    // Create a vector store from the documents.
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );

    const retriever = new ContextualCompressionRetriever({
      baseCompressor,
      baseRetriever: vectorStore.asRetriever(),
    });

    const chain = RetrievalQAChain.fromLLM(model, retriever);

    const res = await chain.call({
      query,
    });

    console.log("----", res);

    return res;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

// import "dotenv/config";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { loadQAStuffChain } from "langchain/chains";
// import { TextLoader } from "langchain/document_loaders/fs/text";
// import { DocxLoader } from "langchain/document_loaders/fs/docx";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
// import { Document } from "@langchain/core/documents";
// import { DocumentInterface } from "@langchain/core/documents";

// export default async (question = "", filePath = "") => {
//   const fileExtension = filePath.split(".").pop();
//   let loader;

//   if (fileExtension === "docx") {
//     loader = new DocxLoader(filePath);
//   } else if (fileExtension === "txt") {
//     loader = new TextLoader(filePath);
//   } else if (fileExtension === "pdf") {
//     loader = new PDFLoader(filePath, {
//       splitPages: false,
//     });
//   } else {
//     return "unsupported file type";
//   }

//   const docs = await loader.load();

//   const vectorStore = await MemoryVectorStore.fromDocuments(
//     docs,
//     new OpenAIEmbeddings()
//   );

//   const searchResponse = await vectorStore.similaritySearch(question, 1);
//   const textRes = searchResponse
//     .map((item: DocumentInterface<Record<string, any>>) => item?.pageContent)
//     .join("\n");
//   const llm = new OpenAI({ modelName: "gpt-4" });
//   const chain = loadQAStuffChain(llm);

//   const result = await chain.invoke({
//     input_documents: [new Document({ pageContent: `${textRes}` })],
//     question,
//   });

//   console.log(`\n\n Question: ${question}`);
//   console.log(`\n\n Answer: ${result.text}`);
//   return result.text;
// };
