import { test, expect } from 'playwright-test-coverage';
class ServerMock {

    async login() {
        await page.route('*/**/api/auth', async (route) => {
            const loginReq = { email: 'q@jwt.com', password: 'qqq' };
            const loginRes = {
                user: {
                    id: 3,
                    name: 'q',
                    email: 'q@jwt.com',
                    roles: [{ role: 'diner' }],
                },
                token: 'abcdef',
            };
            expect(route.request().method()).toBe('PUT');
            expect(route.request().postDataJSON()).toMatchObject(loginReq);
            await route.fulfill({ json: loginRes });
        });
    }

    async register() {
        await page.route('*/**/api/auth', async (route) => {
            const registerReq = { email: 'q@jwt.com', password: 'qqq' };
            const registerRes = {
                user: {
                    id: 3,
                    name: 'q',
                    email: 'q@jwt.com',
                    roles: [{ role: 'diner' }],
                },
                token: 'abcdef',
            };
            expect(route.request().method()).toBe('POST');
            expect(route.request().postDataJSON()).toMatchObject(registerReq);
            await route.fulfill({ json: registerRes });
        });
    }

    async getMenu() {
        await page.route('*/**/api/order/menu', async (route) => {
            const registerReq = { email: 'q@jwt.com', password: 'qqq' };
            const registerRes = {
                user: {
                    id: 3,
                    name: 'q',
                    email: 'q@jwt.com',
                    roles: [{ role: 'diner' }],
                },
                token: 'abcdef',
            };
            expect(route.request().method()).toBe('GET');
            expect(route.request().postDataJSON()).toMatchObject(registerReq);
            await route.fulfill({ json: registerRes });
        });
    }

}

const server = new ServerMock();
export { server as ServerMock };