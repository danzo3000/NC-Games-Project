const request = require("supertest");
const seed = require("../db/seeds/seed");
const app = require("../db/app");
const connection = require("../db/connection");
const testData = require("../db/data/test-data/index");
require("jest-sorted");
const endPoints = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return connection.end();
});

describe("app", () => {
  describe("/api/categories", () => {
    it("200: GET - should return an array of categories objects", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body }) => {
          expect(body.categories).toHaveLength(4);
          body.categories.forEach((category) => {
            expect(category).toHaveProperty("slug", expect.any(String));
            expect(category).toHaveProperty("description", expect.any(String));
          });
        });
    });
  });
  describe("/api/reviews", () => {
    it("200: GET - should return an array of review objects", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toHaveLength(13);
          body.reviews.forEach((review) => {
            expect(review).toHaveProperty("review_id", expect.any(Number));
            expect(review).toHaveProperty("owner", expect.any(String));
            expect(review).toHaveProperty("title", expect.any(String));
            expect(review).toHaveProperty("designer", expect.any(String));
            expect(review).toHaveProperty("owner", expect.any(String));
            expect(review).toHaveProperty("category", expect.any(String));
            expect(review).toHaveProperty("review_img_url", expect.any(String));
            expect(review).toHaveProperty("review_body", expect.any(String));
            expect(review).toHaveProperty("created_at", expect.any(String));
            expect(review).toHaveProperty("votes", expect.any(Number));
            expect(review).toHaveProperty("comment_count", expect.any(Number));
          });
        });
    });
    it("200: GET - should return an array of review objects sorted by date in descending order", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          console.log(body.reviews);
          expect(body.reviews).toHaveLength(13);
          expect(body.reviews).toBeSorted({
            key: "created_at",
            descending: true,
          });
        });
    });
  });
  describe("/api/reviews/:review_id", () => {
    it("200: GET - should respond with a single review object according to the review_id parameter", () => {
      return request(app)
        .get("/api/reviews/2")
        .expect(200)
        .then(({ body }) => {
          const review = body.review;
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("review_body", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
          expect(review).toHaveProperty("votes", expect.any(Number));
          expect(review).toHaveProperty("comment_count", expect.any(Number));
        });
    });
    it("400: Bad request - should respond with an error message of Bad Request when a user inputs an invalid parameter", () => {
      return request(app)
        .get("/api/reviews/not-a-valid-review_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: Not found - should respond with an error message of Not Found when a user inputs a valid but non-existent parameter", () => {
      return request(app)
        .get("/api/reviews/5000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    it("200: PATCH - should respond with a review object with its votes property incremented when passed a patch object with a positive key of inc_votes", () => {
      const reqBody = {
        inc_votes: 5,
      };
      return request(app)
        .patch("/api/reviews/3")
        .send(reqBody)
        .expect(200)
        .then(({ body }) => {
          const review = body.review;
          expect(review.votes).toBe(10);
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("review_body", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
        });
    });
    it("200: PATCH - should respond with a review object with its votes property decremented when passed a patch object with a negative key of inc_votes", () => {
      const reqBody = {
        inc_votes: -4,
      };
      return request(app)
        .patch("/api/reviews/3")
        .send(reqBody)
        .expect(200)
        .then(({ body }) => {
          const review = body.review;
          expect(review.votes).toBe(1);
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("category", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("review_body", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
        });
    });
    it("404: PATCH - should respond with a custom error message when a patch request is made to a review_id which is in a valid format but does not exist", () => {
      const reqBody = {
        inc_votes: -4,
      };
      return request(app)
        .patch("/api/reviews/3000")
        .send(reqBody)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Review_id not found");
        });
    });
    it("400: PATCH - should respond with a 400 bad request message when a patch request is made to an invalid review_id", () => {
      const reqBody = {
        inc_votes: 5,
      };
      return request(app)
        .patch("/api/reviews/not-a-valid-path")
        .send(reqBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: PATCH - should respond with a 400 Bad reuqest if the inc_votes property has an invalid input value", () => {
      const reqBody = {
        inc_votes: "invalid-input",
      };
      return request(app)
        .patch("/api/reviews/1")
        .send(reqBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: PATCH - should respond with a 400 Missing required field if the inc_votes property is missing", () => {
      const reqBody = {};
      return request(app)
        .patch("/api/reviews/1")
        .send(reqBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing required field");
        });
    });
  });
  describe("/api/reviews/:review_id/comments", () => {
    it("200: GET - should return an array of comments according to the review_id parameter", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body }) => {
          const comments = body.comments;
          expect(comments).toHaveLength(3);
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id", expect.any(Number));
            expect(comment).toHaveProperty("votes", expect.any(Number));
            expect(comment).toHaveProperty("created_at", expect.any(String));
            expect(comment).toHaveProperty("author", expect.any(String));
            expect(comment).toHaveProperty("body", expect.any(String));
            expect(comment).toHaveProperty("review_id", expect.any(Number));
          });
        });
    });
    it("200: GET - should return an array of comments according to the review_id parameter sorted by date in descending order", () => {
      return request(app)
        .get("/api/reviews/3/comments")
        .expect(200)
        .then(({ body }) => {
          console.log(body.comments);
          expect(body.comments).toHaveLength(3);
          expect(body.comments).toBeSorted({
            key: "created_at",
            descending: true,
          });
        });
    });
    it("200: GET - should return an empty array if the review_id exists but has no comments", () => {
      return request(app)
        .get("/api/reviews/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    it("400: GET - should return an error message of Bad Request when a user input an invalid parameter", () => {
      return request(app)
        .get("/api/reviews/not-a-valid-input/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: GET - should return an error message of Review ID not found when a user inputs a valid but non-existent parameter", () => {
      return request(app)
        .get("/api/reviews/1000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Review ID not found");
        });
    });
    it("201: POST - should respond with the posted comment which has two properties of username and body", () => {
      const reqBody = {
        username: "bainesface",
        body: "Some Test Body Example Text",
      };
      return request(app)
        .post("/api/reviews/1/comments")
        .send(reqBody)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toHaveProperty("votes", expect.any(Number));
          expect(body.comment).toHaveProperty("created_at", expect.any(String));
          expect(body.comment).toHaveProperty("comment_id", expect.any(Number));
          expect(body.comment.author).toBe("bainesface");
          expect(body.comment.body).toBe("Some Test Body Example Text");
          expect(body.comment.review_id).toBe(1);
        });
    });
    it("400: POST - should return an error message of Bad Request when a user inputs an invalid review_id", () => {
      const reqBody = {
        username: "bainesface",
        body: "Some Test Body Example Text",
      };
      return request(app)
        .post("/api/reviews/not-a-valid-id/comments")
        .send(reqBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: POST - should return an error message of Not found when passed a review_id which is valid but non-existent", () => {
      const reqBody = {
        username: "bainesface",
        body: "Some Test Body Example Text",
      };
      return request(app)
        .post("/api/reviews/1000/comments")
        .send(reqBody)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
    it("400: POST - should respond with a 400 when a required field is missing from the post object", () => {
      const reqBody = {
        username: "bainesface",
      };
      return request(app)
        .post("/api/reviews/1/comments")
        .send(reqBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing required field");
        });
    });
    it("404: POST - should respond with a 404 error when the username passed on the post object does not exist", () => {
      const reqBody = {
        username: "user-does-not-exist",
        body: "Some Test Body Example Text",
      };
      return request(app)
        .post("/api/reviews/1/comments")
        .send(reqBody)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
  });
  describe("/api/reviews?category=:category", () => {
    it("200: GET - should return a single review object matching the queried category when passed a valid query if there is only 1 match ", () => {
      return request(app)
        .get("/api/reviews?category=dexterity")
        .expect(200)
        .then(({ body }) => {
          const review = body.reviews;
          expect(review.category).toBe("dexterity");
          expect(review).toHaveProperty("review_id", expect.any(Number));
          expect(review).toHaveProperty("owner", expect.any(String));
          expect(review).toHaveProperty("title", expect.any(String));
          expect(review).toHaveProperty("designer", expect.any(String));
          expect(review).toHaveProperty("review_img_url", expect.any(String));
          expect(review).toHaveProperty("review_body", expect.any(String));
          expect(review).toHaveProperty("created_at", expect.any(String));
        });
    });
    it("200: GET - should return an array of review objects matching the queried category when passed a valid query if there are multiple matches", () => {
      return request(app)
        .get("/api/reviews?category=social deduction")
        .expect(200)
        .then(({ body }) => {
          const reviews = body.reviews;
          expect(reviews).toHaveLength(11);
          reviews.forEach((review) => {
            expect(review.category).toBe("social deduction");
            expect(review).toHaveProperty("review_id", expect.any(Number));
            expect(review).toHaveProperty("owner", expect.any(String));
            expect(review).toHaveProperty("title", expect.any(String));
            expect(review).toHaveProperty("designer", expect.any(String));
            expect(review).toHaveProperty("review_img_url", expect.any(String));
            expect(review).toHaveProperty("review_body", expect.any(String));
            expect(review).toHaveProperty("created_at", expect.any(String));
          });
        });
    });
    it("200: GET - should return an array of review objects sorted by the passed sort_by query in descending order when a valid query is passed", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toHaveLength(13);
          expect(body.reviews).toBeSorted({
            key: "votes",
            descending: true,
          });
        });
    });
    it("200: GET - should return an array of review objects sorted by the default created_at in ascending order if an order query of asc is passed without a sort_by query", () => {
      return request(app)
        .get("/api/reviews?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toHaveLength(13);
          expect(body.reviews).toBeSorted({
            key: "created_at",
            descening: false,
          });
        });
    });
    it("200: GET - should return an array of review objects sorted by the passed sort_by query and in ascending order when passed both an order and sort_by query", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toHaveLength(13);
          expect(body.reviews).toBeSorted({
            key: "votes",
            descending: false,
          });
        });
    });
    it("200: GET - should return an empty array if the query property and value are valid but have no results", () => {
      return request(app)
        .get("/api/reviews?category=children's games")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toEqual([]);
        });
    });
    it("400: GET - should return an error of Invalid query if the query property is invalid", () => {
      return request(app)
        .get("/api/reviews?not-a-valid-query=votes")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid query");
        });
    });
    it("400: GET - should return an error of Bad Request when passed an invalid sort_by argument", () => {
      return request(app)
        .get("/api/reviews?sort_by=not-a-valid-input")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: GET - should return an error of Bad Request when passed an invalid order argument", () => {
      return request(app)
        .get("/api/reviews?order=not-a-valid-order")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: GET - should return an error of Not found if the query property is valid and its value is in a valid format but does not exist", () => {
      return request(app)
        .get("/api/reviews?category=valid-but-non-existent")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });
  });
  describe("/api/users", () => {
    it("200: GET - should respond with an array of user objects", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users).toHaveLength(4);
          body.users.forEach((user) => {
            expect(user).toHaveProperty("username", expect.any(String));
            expect(user).toHaveProperty("name", expect.any(String));
            expect(user).toHaveProperty("avatar_url", expect.any(String));
          });
        });
    });
    it("404: GET - should send a custom 404 error message of Path not found if the path entered is invalid", () => {
      return request(app)
        .get("/api/not-a-valid-path")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Path not found");
        });
    });
  });
  describe("/api/comments/:comment_id", () => {
    it("204: DELETE - should delete the comment with the passed comment_id and send back a status 204 with no body content", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    it("400: DELETE - should respond with an error of Bad Request if passed an invalid comment_id", () => {
      return request(app)
        .delete("/api/comments/not-a-valid-input")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: DELETE - should respond with an error of Not Found if passed a valid but non-existent comment_id", () => {
      return request(app)
        .delete("/api/comments/100")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Comment_id Not Found");
        });
    });
  });
  describe("/api", () => {
    it("200: GET - should return JSON text describing all the available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const endpoints = body.endPoints;
          expect(endpoints).toEqual(endPoints);
        });
    });
  });
});
