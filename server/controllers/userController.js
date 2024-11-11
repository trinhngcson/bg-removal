import { Webhook } from "svix";
import CryptoJS from "crypto-js";
import moment from "moment";
import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";
import axios from "axios";
import qs from "qs";
//API controller funtion to manage clerk user with database
//http://localhost:4000/api/user/webhooks

const clerkWebhooks = async (req, res) => {
  try {
    //Create a Svix instance with clerk webhooks
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api controller functiuon to get user avalable credits data
const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const userData = await userModel.findOne({ clerkId });
    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//config gateway
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const paymentZalopay = async (req, res) => {
  try {
    const { clerkId, planId, amount } = req.body;
    const userData = await userModel.findOne({ clerkId });

    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    let credits, plan, date;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        break;
      case "Business":
        plan = "Business";
        credits = 5000;
        break;
    }
    date = Date.now();
    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date,
    };
    const newTransaction = await transactionModel.create(transactionData);
    const embed_data = {
      redirecturl: "https://bg-removal-fawn.vercel.app/buy",
    };

    const items = [{ [plan]: credits }];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: newTransaction._id,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: `#${transID} - BG.Removal - Payment for ${credits} credits`,
      bank_code: "",
      callback_url:
        "https://48e5-2402-800-6311-b379-dcc8-9df3-c99f-6630.ngrok-free.app/api/user/callback",
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const result = await axios.post(config.endpoint, null, { params: order });
    res.json({
      success: true,
      url: result.data.order_url,
      transID: `${moment().format("YYMMDD")}_${transID}`,
      _id: newTransaction._id,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const paymentCallBack = async (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    // let data = JSON.parse(req.body.data);
    // let dataCredits = data.item;

    // let creditsVaule = JSON.parse(dataCredits);
    // let plan = Object.keys(creditsVaule[0]);
    // let credits = creditsVaule[0][plan[0]];
    // let amount = data.amount;
    // let date = Date.now();
    // let clerkId = data.app_user;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ

      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // const transactionData = {
      //   clerkId,
      //   planKey,
      //   amount,
      //   credits,
      //   date,
      //   payment,
      // };

      // const newTransaction = await transactionModel.create(transactionData);
      // console.log(newTransaction);

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
};

const checkStatusOrder = async (req, res) => {
  const { app_trans_id, paymentId } = req.body;

  let postData = {
    app_id: config.app_id,
    app_trans_id, // Input your app_trans_id
  };

  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: "post",
    url: "https://sb-openapi.zalopay.vn/v2/query",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(postData),
  };

  try {
    const result = await axios(postConfig);
    switch (result.data.return_code) {
      case 3:
        res.json({ message: false, message: "Not yet paid or in process" });
        break;
      case 2:
        res.json({ message: false, message: "Something wrong, try again" });
        break;
      case 1: {
        const transactionData = await transactionModel.findById(paymentId);

        if (transactionData.payment) {
          return res.json({ success: false, message: "Payment Failed" });
        }
        //add credit for user
        const userData = await userModel.findOne({
          clerkId: transactionData.clerkId,
        });
        const creditBalance = userData.creditBalance + transactionData.credits;

        await userModel.findByIdAndUpdate(userData._id, { creditBalance });
        // making the payment true
        await transactionModel.findByIdAndUpdate(transactionData._id, {
          payment: true,
        });
        res.json({
          success: true,
          message: "Credits Added",
        });
        break;
      }
    }
    /**
   * kết quả mẫu
    {
      "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
      "return_message": "",
      "sub_return_code": 1,
      "sub_return_message": "",
      "is_processing": false,
      "amount": 50000,
      "zp_trans_id": 240331000000175,
      "server_time": 1711857138483,
      "discount_amount": 0
    }
  */
  } catch (error) {
    console.log("lỗi");
    console.log(error);
  }
};
export {
  userCredits,
  clerkWebhooks,
  paymentZalopay,
  paymentCallBack,
  checkStatusOrder,
};
