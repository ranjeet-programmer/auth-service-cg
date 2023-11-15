import { calculateDiscount } from "./src/utlis";
import request from "supertest";
import app from "./src/app";

describe.skip("App", () => {
    it("should calculate the discount", () => {
        const res = calculateDiscount(1000, 20);
        expect(res).toBe(200);
    });

    it("should return 200 status", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
