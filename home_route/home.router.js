const express = require("express");
const homeRouter = express.Router();
const mysqlConnection = require("../database/database");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const { isAuthenticated } = require("../passport/passport.config");

// <RETURN ALL USER INFO>>==================================================================================
homeRouter.get("/user/:id", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const selectUser = `select u.id, u.first_name, u.last_name, u.email, u.icon, u.last_visit, uf.balance from users u join user_finance uf on u.id = uf.user_id where u.id = ?`;
  mysqlConnection.query(selectUser, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json({
      id: result[0].id,
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      icon: result[0].icon,
      email: result[0].email,
      lastVisit: result[0].last_visit,
      balance: result[0].balance,
    });
  });
});

homeRouter.post("/user/:id/update-info", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const { firstName, lastName, email, balance } = req.body;
  const updateUser = `update users u 
                      join user_finance uf on u.id = uf.user_id
                      set u.first_name = ?, u.last_name = ?, u.email = ?, u.last_visit = now(), uf.balance = ?
                      where u.id = ?`;
  mysqlConnection.query(updateUser, [firstName, lastName, email, balance, id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json({ img: `User ${id} update` });
  });
});

homeRouter.post("/user/:id/update-password", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const password = req.body.password;

  const updateUser = `update users set users.password = ? where users.id = ?`;
  mysqlConnection.query(updateUser, [password, id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Server error, try again later", err });
    }

    res.json({ msg: `Password was update`, status: true });
  });
});

homeRouter.post("/user/:id/upload-icon", isAuthenticated, function (req, res) {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const fileName = files['user-icon'].name
    const pathFIle = files['user-icon'].path;
    const saveFileFolder = path.dirname(process.env.NODE_PATH) + "/uploads/user-icon/" + fileName;
    const rawData = fs.readFileSync(pathFIle);
    fs.writeFile(saveFileFolder, rawData, function (err) {
      if (err) {
        res.json({msg: "Server error, try again later"})
        return
      };
      const userId = req.params.id
      const fullPathImage = `http://localhost:3001/public/images/user-icon/${fileName}`
      const update = `update users set users.icon = ? where users.id = ?`
      mysqlConnection.query(update, [fullPathImage,userId], (err, result) => {
        if (err) {
          return res.status(500).json({ msg: "Server error, try again later", err });
        }
        res.json({msg: 'Success image upload', src: fullPathImage})
      })
    });
  });
});
// <RETURN ALL USER INFO>>==================================================================================

// </RETURN USER FINANCE INFORMATION>==================================================================================
homeRouter.get("/user/:id/finance", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const selectFinance = `select * from user_finance where id =?`;
  mysqlConnection.query(selectFinance, [id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
      return;
    }
    res.json(result[0]);
  });
});
homeRouter.post("/user/:id/update/balance", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const { balance } = req.body;
  const updateBalance = `update user_finance SET balance = ? where user_id = ?`;
  mysqlConnection.query(updateBalance, [balance, id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
      return;
    }
    res.json({ balance });
  });
});
homeRouter.post("/user/:id/update/expenses", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const { expenses } = req.body;
  const updateExpenses = `update user_finance SET expenses = ? where user_id = ?`;
  mysqlConnection.query(updateExpenses, [expenses, id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
      return;
    }
    res.json({ expenses });
  });
});
homeRouter.post("/user/:id/update/income", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const { income } = req.body;
  const updateIncome = `update user_finance SET income = ? where user_id = ?`;
  mysqlConnection.query(updateIncome, [income, id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json({ income });
  });
});
homeRouter.post("/user/:id/create/default-finance", isAuthenticated, function (req, res) {
  const user_id = +req.param.id;
  const insert = `insert into user_finance (balance, expenses, income, user_id) values('0', '0', '0', '${user_id}')`;
  mysqlConnection.query(insert, (err, result) => {
    if (err) {
      return res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
// </RETURN USER FINANCE INFORMATION>================================================================================

// <RETURN USER SAVING INFORMATION>==================================================================================
// RETURN USER ALL SAVINGS
homeRouter.get("/user/:id/savings", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const select = `select * from user_savings where user_id =?`;
  mysqlConnection.query(select, [id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
// RETURN USER SAVING BY ID
homeRouter.get("/user/:id/savings/:saving_id", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const saving_id = req.params.saving_id;
  const select = `select * from user_savings where user_id =? and id=?`;
  mysqlConnection.query(select, [id, saving_id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result[0]);
  });
});
// USER ADD SAVING
homeRouter.post("/user/:id/add/savings", isAuthenticated, function (req, res) {
  const { name, img, amount } = req.body;
  const id = req.params.id;
  const insert = `insert into user_savings (name, img, amount, user_id) value ('${name}', '${img}', '${amount}', '${id}')`;
  mysqlConnection.query(insert, (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    if (result) {
      res.json(result);
    }
  });
});
// USER UPDATE SAVING
homeRouter.post("/user/:id/update/savings", isAuthenticated, function (req, res) {
  const user_id = req.params.id;
  const amount = Math.floor(req.body.amount);
  const id = req.body.id;
  const update = `update user_savings SET amount = ? where user_id = ? and id = ?`;
  mysqlConnection.query(update, [amount, user_id, id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
homeRouter.delete("/user/:user_id/delete/savings/:id", isAuthenticated, function (req, res) {
  const user_id = req.params.user_id;
  const id = req.params.id;
  const deleteSaving = `delete from user_savings where id = ? and user_id = ?`;
  mysqlConnection.query(deleteSaving, [id, user_id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
// <RETURN USER SAVING INFORMATION>==================================================================================

// <RETURN USER SPEND INFORMATION>==================================================================================
// RETURN USER ALL SPENDS
homeRouter.get("/user/:id/spends", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const select = `select * from user_spends where user_id =?`;
  mysqlConnection.query(select, [id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
// RETURN USER SPENDS BY ID
homeRouter.get("/user/:id/spends/:spends_id", isAuthenticated, function (req, res) {
  const id = req.params.id;
  const spends_id = req.params.spends_id;
  const select = `select * from user_spends where user_id =? and id=?`;
  mysqlConnection.query(select, [id, spends_id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result[0]);
  });
});
// USER ADD SPENDS
homeRouter.post("/user/:id/add/spends", isAuthenticated, function (req, res) {
  const userId = req.params.id;
  const { name, img, amount, savingId } = req.body;
  const insert = `insert into user_spends (name, img, amount, savingId, user_id) value ('${name}', '${img}', '${amount}', '${savingId}', '${userId}')`;
  mysqlConnection.query(insert, (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
// RETURN USER UPDATE SPENDS
homeRouter.post("/user/:id/update/spends", isAuthenticated, function (req, res) {
  const user_id = req.params.id;
  const amount = Math.floor(req.body.amount);
  const id = req.body.id;
  const update = `update user_spends SET amount = ? where user_id = ? and id = ?`;
  mysqlConnection.query(update, [amount, user_id, id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
homeRouter.delete("/user/:user_id/delete/spends/:id", isAuthenticated, function (req, res) {
  const user_id = req.params.user_id;
  const id = req.params.id;
  const deleteSpend = `delete from user_spends where id = ? and user_id = ?`;
  mysqlConnection.query(deleteSpend, [id, user_id], (err, result) => {
    if (err) {
      res.status(500).json({ msg: "Server error, try again later" });
    }
    res.json(result);
  });
});
// </RETURN USER SPEND INFORMATION>==================================================================================

module.exports = {
  homeRouter: homeRouter,
};
