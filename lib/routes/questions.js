var express = require("express");
var router = express.Router();
var Question = require("../models/question");
var tools = require("../utilities/validate");
var error = require("../utilities/error");
var requireLogin = require("../server/authentication").authenticate;
var onlyAdmin = require("../server/authentication").isAdmin;
var onlyUser = require("../server/authentication").isSelf;
var onlyOwnerOrAdmin = require("../server/authentication").isAdminOrOwner;
var ObjectID = require("mongoskin").ObjectID;
var _ = require("lodash");
var async = require("async");

router.get("/", [
  function (req, res, next) {
    console.log("boooooooo get here ", req.body, "query ===> ", req.query);

    Question.findAll(function (err, questions) {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        questions: questions
      });
    });
  }
]);

router.get("/:id", [
  // requireLogin,
  // onlyAdmin,
  function (req, res, next) {
    console.log("I'm getting here ====> YEY")
    Question.findById(req.params.id, function (err, question) {
      if (err) {
        return next(err);
      }

      res.status(200).json({
        question: question
      });
    });
  }
]);

router.post("/", [
  // requireLogin,
  // onlyAdmin,
  function (req, res, next) {
    console.log("This is the body ==> ", req.body);

    if (!req.body.question || !req.body.question.question ||
      !req.body.question.options || !req.body.question.options.length ||
      !req.body.question.difficulty || !req.body.question.type) {
      return next(error.badRequest("Invalid request."));
    }

    var correct = req.body.question.options.filter(function (item) {
      return item.correct;
    });

    if (!correct.length) {
      return next(error.badRequest("Invalid request."));
    }

    var question = new Question(req.body.question);

    question.insert(function (err, question) {
      if (err) {
        return next(err);
      }

      res.status(201).send({
        message: "Question successfully added."
      });
    });
  }
]);

router.post("/bulk", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    if (!req.body || !req.body.questions || !req.body.questions.length) {
      return next(error.badRequest("Invalid request."));
    }

    var invalid = req.body.questions.filter(function (item, index) {
      if (!item.question || !item.options || item.options.length < 4
        || !item.difficulty || !item.type || !checkOption(item.options)) {
        req.body.questions.splice(index, index);
        return item;
      }
    });

    Question.bulkInsert(req.body.questions, function (err, questions) {
      if (err) {
        return next(err);
      }

      res.status(201).send({
        success: {
          message: "Questions successfully added.",
          count: questions.length,
        },
        faliure: {
          message: "Invalid format in paylod.",
          questions: invalid
        }
      });
    });
  }
]);

router.put("/:id", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    if (!req.body || !req.body.question &&
      !req.body.options && !req.body.difficulty && !req.body.type) {
      return next(error.badRequest("Invalid request."));
    }

    Question.findById(req.params.id, function (err, question) {
      if (err) {
        return next(err);
      }

      question.update(req.body, function (err, count) {
        if (count) {
          res.status(201).send({
            message: "Question successfully updated."
          });
        }
      });
    });
  }
]);


router.delete("/:id", [
  requireLogin,
  onlyAdmin,
  function (req, res, next) {
    Question.removeById(req.params.id, function (err, count) {
      if (err) {
        return next(err);
      }

      if (!count) {
        return next(error.notCreated("Request not processed."));
      }

      res.status(201).send({
        message: "Question successfully deleted."
      });
    });
  }
])

function checkOption (options) {
  var invalid = options.filter(function (item) {
    return item.correct;
  });

  return invalid.length ? true : false;
}

module.exports = router;
