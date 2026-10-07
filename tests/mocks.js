import { test, expect } from 'playwright-test-coverage';
class ServerMock {

    async login(page) {
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

    async register(page) {
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

    async logout(page) {
        await page.route('*/**/api/auth', async (route) => {
            const logoutRes = {
                message: 'logout successful'
            };
            expect(route.request().method()).toBe('DELETE');
            await route.fulfill({ json: logoutRes });
        });
    }

    async getMenu(page) {
        await page.route('*/**/api/order/menu', async (route) => {
            const menuRes = [
                { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
                { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
            ];
            expect(route.request().method()).toBe('GET');
            await route.fulfill({ json: menuRes });
        });
    }

    async getFranchises(page) {
        await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
            const franchiseRes = {
                franchises: [
                    {
                        id: 1,
                        name: 'pizzaPocket',
                        stores: [{ id: 1, name: 'SLC'}]
                    },
                    {
                        id: 2,
                        name: 'LotaPizza',
                        stores: [
                            { id: 4, name: 'Lehi' },
                            { id: 5, name: 'Springville' },
                            { id: 6, name: 'American Fork' },
                        ],
                    },
                    { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
                    { id: 4, name: 'topSpot', stores: [] },
                ],
            };
            expect(route.request().method()).toBe('GET');
            await route.fulfill({ json: franchiseRes });
        });
    }

    async basicInit(page) {
        await this.register(page);
        await this.getMenu(page);
        await this.getFranchises(page);
        await this.me(page);
        // await this.logout(page);
    }

    async order(page) {
        await page.route('*/**/api/order', async (route) => {
            const orderReq = {
                franchiseId: 1, storeId: "1", items: [
                    { menuId: 1, description: "Veggie", price: 0.0038 },
                    { menuId: 2, description: "Pepperoni", price: 0.0042 }
                ]
            };
            const orderRes = {
                order: orderReq,
                id: 1
            }
            expect(route.request().method()).toBe('POST');
            expect(route.request().postDataJSON()).toMatchObject(orderReq);
            await route.fulfill({ json: orderRes });
        });
    }

    async me(page) {
        await page.route('*/**/api/user/me', async (route) => {
            const meRes = {
                id: 3,
                name: 'q',
                email: 'q@jwt.com',
                roles: [{ role: 'diner' }],
            };
            expect(route.request().method()).toBe('GET');
            await route.fulfill({ json: meRes });
        });
    }

    async verify(page) {
        await page.route('https://pizza-factory.cs329.click/api/order/verify', async (route) => {
            const orderRes = {
                message: "valid",
                payload: {
                    vendor: {
                        id: "slarmoo",
                        name: "Matthew Medford"
                    },
                    diner: {
                        id: 1,
                        name: "常用名字",
                        email: "a@jwt.com"
                    },
                    order: {
                        items: [
                            {
                                menuId: 1,
                                description: "Veggie",
                                price: 0.0038
                            },
                            { menuId: 2, description: "Pepperoni", price: 0.0042 }
                        ],
                        storeId: 1,
                        franchiseId: 1,
                        id: 1
                    }
                }
            }
            expect(route.request().method()).toBe('POST');
            expectValidJwt(route.request().postDataJSON().jwt);
            // expect(route.request().postDataJSON()).toMatchObject(orderReq);
            await route.fulfill({ json: orderRes });
        });
    }

}

function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

const server = new ServerMock();
export { server as ServerMock };