import instance from "..";

const createCustomer = async () => {
  try {
    instance.customers.create({
      name: "Gaurav Kumar",
      contact: 9123456780,
      email: "gaurav.kumar@example.com",
      fail_existing: 0,
      gstin: "29XAbbA4369J1PA",
      notes: {
        notes_key_1: "Tea, Earl Grey, Hot",
        notes_key_2: "Tea, Earl Grey… decaf.",
      },
    });
  } catch (error) {
    throw error;
  }
};

const fetchCustomer = async (customerId: string) => {
  try {
    const customer = await instance.customers.fetch(customerId);
    return customer;
  } catch (error) {
    throw error;
  }
};

const fetchAllCustomers = async () => {
  try {
    const customers = await instance.customers.all();
    return customers;
  } catch (error) {
    throw error;
  }
};

//https://github.com/razorpay/razorpay-node/blob/master/documents/customer.md
