import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils/index";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        console.log(connection);
    });
    beforeEach(async () => {
        // database truncate
        await connection.dropDatabase();
        await connection.synchronize();
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
        it("should assign a customer role", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "ab@gmail.com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            await request(app).post("/auth/register").send(userData);

            //Assert

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });
        it("should store the hashed password in the database", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "ab@gmail.com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            await request(app).post("/auth/register").send(userData);

            // assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });
        it("should return 400 status code if email is already exists", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "ab@gmail.com",
                password: "secret_password",
                role: Roles.CUSTOMER,
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save(userData);

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            const users = await userRepository.find();
            // assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it("should return the access token and refresh token inside a cookie", async () => {
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

            interface Headers {
                ["set-cookie"]: string[];
            }

            let accessToken = null;
            let refreshToken = null;

            const cookies = (response.headers as Headers)["set-cookie"] || [];
            console.log("cookies", cookies);
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            // Assert
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
        });
    });

    describe("Fields are Missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // A : assert [ check the expected output with actual output ]
            expect(response.statusCode).toBe(400);
            console.log(response.body);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(response.body.errors[0].msg).toBe("Email is required");

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if first name is missing", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "",
                lastName: "hinge",
                email: "",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // A : assert [ check the expected output with actual output ]
            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if last name is missing", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "",
                email: "abc@gmail.com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // A : assert [ check the expected output with actual output ]
            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password is missing", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "",
                email: "abc@gmail.com",
                password: "",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // A : assert [ check the expected output with actual output ]
            expect(response.statusCode).toBe(400);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trime the email field", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "  ab@gmail.com ",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            await request(app).post("/auth/register").send(userData);

            // assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            expect(user.email).toBe("ab@gmail.com");
        });

        it("should return 400 status code if email is not a valid email", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "invalid.email@com",
                password: "secret_password",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //assert
            expect(response.statusCode).toBe(400);

            // user should not get created in db
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password length is less than eight characters", async () => {
            // A : arrange [ arrange all the data for test case]
            const userData = {
                firstName: "ranjeet",
                lastName: "hinge",
                email: "abc@gmail.com",
                password: "test",
            };

            // A : act [ trigger the action ]
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //assert
            expect(response.statusCode).toBe(400);

            // user should not get created in db
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(0);
        });
    });
});
