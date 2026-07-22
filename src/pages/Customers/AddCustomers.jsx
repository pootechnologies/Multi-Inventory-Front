import { PackageCheck, Plus, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { t } from "i18next";

const AddCustomer = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState([
    { productInput: "", selectedProduct: null, quantity: 0 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const formatter = new Intl.NumberFormat("am-ET", {
    style: "currency",
    currency: "ETB",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    const customer = selectedOption ? selectedOption.value : null;
    setSelectedCustomer(customer);
    setPhoneNumber(customer ? customer.phone : "");
    setAddress(customer ? customer.address : "");
  };

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].productInput = selectedOption ? selectedOption.label : "";
    newItems[index].selectedProduct = selectedOption
      ? selectedOption.value
      : null;
    setItems(newItems);
  };

  const handleQuantityChange = (index, event) => {
    const newItems = [...items];
    const quantity = event.target.value;
    newItems[index].quantity = quantity === "" ? 0 : parseInt(quantity, 10);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { productInput: "", selectedProduct: null, quantity: 0 },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotalAmount = () => {
    return items
      .reduce((total, item) => {
        if (item.selectedProduct && item.quantity > 0) {
          return total + item.selectedProduct.selling_price * item.quantity;
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const order = {
      customer: selectedCustomer ? selectedCustomer.id : null,
      status: "Pending",
      total_amount: calculateTotalAmount(),
      phone_number: phoneNumber,
      address: address,
      items: items
        .filter((item) => item.selectedProduct && item.quantity > 0)
        .map((item) => ({
          product: item.selectedProduct.id,
          quantity: item.quantity,
          price: item.selectedProduct.selling_price,
        })),
    };
    try {
      await axiosInstance.post(API_ENDPOINTS.ORDERS, order);
      toast.success("Order made successfully!");
      setItems([{ productInput: "", selectedProduct: null, quantity: 0 }]);
      setSelectedCustomer(null);
      setPhoneNumber("");
      setAddress("");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("An error occurred while submitting the order.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCustomer({ name: "", phone: "", address: "" });
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value,
    });
  };

  const handleNewCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CUSTOMERS, newCustomer);
      toast.success("Customer added successfully!");
      closeModal();
      // Fetch customers again to update the list
      const fetchCustomers = async () => {
        try {
          const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS);
          setCustomers(response.data);
        } catch (error) {
          console.error("Error fetching customers:", error);
        }
      };
      fetchCustomers();
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding the customer.");
    }
  };

  return (
    <div className="relative p-4 bg-white rounded-md shadow dark:bg-gray-800 sm:p-5 container h-full">
      <ToastContainer />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 mb-2 border-b ">
        Place order
      </h3>
      <button
        className="p-2 bg-blue-400 text-white rounded-md mt-2 mb-2"
        onClick={openModal}
      >
        Add new Customer
      </button>
      <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-4 ">
        <div className="lg:col-span-4 w-full">
          <form onSubmit={handleSubmit} className="space-y-6 w-full lg:w-2/3">
            {/* Customer Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="customer-name"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Name
              </label>
              <Select
                id="customer-name"
                options={customers.map((customer) => ({
                  label: customer.name,
                  value: customer,
                }))}
                placeholder="Select customer name"
                onChange={handleCustomerChange}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            {/* Address Input */}
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
            {/* Products Section */}
            {items.map((item, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <label
                    htmlFor={`product-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Name
                  </label>
                  <Select
                    id={`product-${index}`}
                    value={
                      item.selectedProduct
                        ? {
                            label: `${item.selectedProduct.category_name}`,
                            value: item.selectedProduct,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleProductChange(index, selectedOption)
                    }
                    options={products.map((product) => ({
                      label: `${product.category_name}`,
                      value: product,
                    }))}
                    placeholder="Search product..."
                    className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {item.selectedProduct && (
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-gray-800">
                      Price:{" "}
                      <span className="text-blue-600 text-sm">
                        {formatter.format(item.selectedProduct.selling_price)}
                      </span>
                    </p>
                    <div>
                      <label
                        htmlFor={`quantity-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        min="1"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleQuantityChange(index, e)}
                        className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      Total:{" "}
                      <span className="text-blue-600">
                        {formatter.format(
                          item.selectedProduct.selling_price * item.quantity
                        )}
                      </span>
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 "
                >
                  <Trash className="mr-3" />
                  Remove
                </button>
              </div>
            ))}
            <div className="block space-y-4 md:space-y-0 md:flex sm:space-x-10">
              <button
                type="button"
                onClick={addItem}
                className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-3 text-center dark:bg-primary-600 bg-green-600 w-full sm:max-w-52"
              >
                {" "}
                <Plus className="mr-3" />
                Add More Products
              </button>
              <button
                type="submit"
                className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-3 text-center dark:bg-primary-600 bg-blue-600 w-full sm:max-w-52"
              >
                <PackageCheck className="mr-3" />
                Submit Order
              </button>
            </div>
          </form>
        </div>
        {/* Order Summary Card */}
        <div className="mt-5 md:mt-0 w-full p-6 rounded-lg bg-white shadow-slate-400 border lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4 text-gray-800 whitespace-nowrap">
            Order Summary
          </h2>
          {items
            .filter((item) => item.selectedProduct && item.quantity > 0)
            .map((item, index) => (
              <div key={index} className="border-b border-gray-300 py-3">
                <p>
                  <span className="font-semibold text-gray-800">
                    {item.selectedProduct.name}
                  </span>
                  {item.quantity} pcs -{" "}
                  {formatter.format(
                    item.selectedProduct.selling_price * item.quantity
                  )}
                </p>
              </div>
            ))}
          <div className="mt-4">
            <span className="font-semibold text-gray-800 text-sm">
              Total Amount
            </span>
            <p className="text-xl text-blue-600 ">
              {formatter.format(calculateTotalAmount())}
            </p>
          </div>
        </div>
      </div>
      {/* Modal for adding a new customer */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>
            <form onSubmit={handleNewCustomerSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="new-customer-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="new-customer-name"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleNewCustomerChange}
                  className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="new-customer-phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="new-customer-phone"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleNewCustomerChange}
                  className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="new-customer-address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="new-customer-address"
                  name="address"
                  value={newCustomer.address}
                  onChange={handleNewCustomerChange}
                  className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCustomer;
