import { toast } from "react-toastify";
import { assets, plans } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const BuyCredit = () => {
  const navigate = useNavigate();
  const [exchangeRate, setExchangeRate] = useState(null);
  const [showCurrency, setShowCurrency] = useState(false);
  const { getToken } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const url = window.location.href;

  const paymentZalopay = async (planId, amount) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + "/api/user/payment",
        { planId, amount },
        { headers: { token } }
      );
      if (data && data.success && data.transID) {
        const newTransId = data.transID;
        const paymentId = data._id;

        localStorage.setItem("newTransId", newTransId);
        localStorage.setItem("paymentId", paymentId);

        window.location.href = data.url;
        // window.open(data.url, "_blank");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const checkPaymentStatus = async (token) => {
    if (localStorage.getItem("newTransId")) {
      try {
        const app_trans_id = localStorage.getItem("newTransId");
        const paymentId = localStorage.getItem("paymentId");
        const result = await axios.post(
          `${backendUrl}/api/user/check-status-order`,
          { app_trans_id, paymentId },
          { headers: { token } }
        );
        if (!result.data.success) {
          toast.warning(result.data.message);
          setTimeout(() => {
            window.location.href = import.meta.env.VITE_FRONTEND_URL + "/buy";
          }, 1000);
        } else {
          toast.success(result.data.message);
          setTimeout(() => {
            window.location.href = import.meta.env.VITE_FRONTEND_URL + "/buy";
          }, 1000);
        }
      } catch (error) {
        console.log("Error: ", error.message);
      }
    }
  };
  useEffect(() => {
    const checkStatus = async () => {
      const token = await getToken();
      if (url !== import.meta.env.VITE_FRONTEND_URL + "/buy") {
        await checkPaymentStatus(token);
      }
    };
    checkStatus();
  }, [url]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const data = await res.json();
        const exchangeRate = data.rates.VND;
        setExchangeRate(exchangeRate);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchData();
  }, []);

  function convertUSDtoVND(usd) {
    try {
      const amountInVND = usd * exchangeRate;
      const value = amountInVND.toLocaleString("it-IT", {
        style: "decimal",
        currency: "VND",
      });
      return value;
    } catch (error) {
      toast.error(error.message);
      navigate("/");
    }
  }
  function convertStringtoNumber(str) {
    let cleanedStr = str.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanedStr);
  }
  return (
    <div className="min-h-[80vh] text-center pt-14 mb-10">
      <button className="border border-gray-400 rounded-full px-10 py-2 mb-6">
        Our Plans
      </button>
      <h1 className="mb-12 sm:mb-20 text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10">
        Choose the plan that&apos;s right for you
      </h1>
      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all duration-700"
            key={index}
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            {!showCurrency && (
              <p className="mt-6">
                <span className="text-3xl font-medium">${item.price}</span>/{" "}
                {item.credits} credits
              </p>
            )}
            {showCurrency && (
              <p className="mt-3">
                <span className="text-3xl font-medium">
                  {convertUSDtoVND(item.price)}
                </span>{" "}
                VND /{item.credits} credits
              </p>
            )}
            <button
              onClick={() => {
                setShowCurrency(!showCurrency);
              }}
              className="mt-3 text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-lg text-center flex justify-center py-2 w-full"
            >
              {!showCurrency ? "to VND" : " to USD"}
            </button>

            <button
              onClick={() => {
                const value = convertUSDtoVND(item.price);
                const amount = Math.ceil(convertStringtoNumber(value));
                paymentZalopay(item.id, amount);
              }}
              className="w-full bg-gray-800 text-white mt-4 text-sm rounded-md py-2.5 min-w-52"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredit;
