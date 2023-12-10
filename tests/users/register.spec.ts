import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../utils/index";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
        // database truncate
        await truncateTables(connection);
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return 201 status code", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "ab@gmail.com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // A : assert [ check the expected output with actual output ]
            expect(response.statusCode).toBe(201);
        });
        it("should return valid JSON response", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "ab@gmail.com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // A : assert [ check the expected output with actual output ]
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });
        it("should persists the user in the database", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "ab@gmail.com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            await request(app).post("/auth/register").send(userData);

            // A : assert [ check the expected output with actual output ]

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
    });
});
