const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const run = async () => {
    const chat_completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content:
                    "WeO is a circular economy e-commerce marketplace that facilitates transactions between prosumers through binary ad units or Offers.An offer consists of three key elements. These elements are set by the producer in the offer maker. Users set the price, the duration (time) of the engagement, and the number of units of goods/ services that they are offering to create an offer.WeO is an online platform that connects users to qualified service providers for any kind of digital engagement. Our platform allows the users to make offers with which qualified service providers can accept or decline. Do you have any other questions about WeO or Offers that I can help you with",
            },
        ],
    });

    console.log(chat_completion);
};

run();
