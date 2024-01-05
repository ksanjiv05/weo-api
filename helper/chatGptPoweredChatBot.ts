import * as fs from "fs";
// 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
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
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);

  // Create a vector store from the documents.
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  const retriever = new ContextualCompressionRetriever({
    baseCompressor,
    baseRetriever: vectorStore.asRetriever(),
  });

  const chain = RetrievalQAChain.fromLLM(model, retriever);

  const res = await chain.call({
    query,
  });

  return res;
};
