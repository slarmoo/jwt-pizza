import { test, expect } from 'playwright-test-coverage';
class ServerMock {

    franchises = [
        {
            id: 1,
            name: 'pizzaPocket',
            stores: [{ id: 1, name: 'SLC', totalRevenue: 0 }],
            admins: [{ email: 'f@jwt.com', id: 3, name: 'pizza franchisee' }]
        },
        // {
        //     id: 2,
        //     name: 'LotaPizza',
        //     stores: [
        //         { id: 4, name: 'Lehi' },
        //         { id: 5, name: 'Springville' },
        //         { id: 6, name: 'American Fork' },
        //     ],
        // },
        // { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        // { id: 4, name: 'topSpot', stores: [] },
    ]

    async login(page, asAdmin = false, asFranchisee = false) {
        await page.route('*/**/api/auth', async (route) => {
            if (route.request().method() !== 'PUT') {
                return route.fallback();
            }
            const loginReq = asFranchisee ? { email: 'f@jwt.com', password: 'franchisee' } : (asAdmin ? { email: 'a@jwt.com', password: 'admin' } : { email: 'd@jwt.com', password: 'diner' });
            const loginRes = asFranchisee ? {
                user: {
                    id: 3,
                    name: 'franchisee',
                    email: 'f@jwt.com',
                    roles: [{ role: 'franchisee' }],
                },
                token: 'abcdef',
            } : (asAdmin ? {
                user: {
                    id: 3,
                    name: 'admin',
                    email: 'a@jwt.com',
                    roles: [{ role: 'admin' }],
                },
                token: 'abcdef',
            } : {
                user: {
                    id: 3,
                    name: 'pizza diner',
                    email: 'd@jwt.com',
                    roles: [{ role: 'diner' }],
                },
                token: 'abcdef',
            });
            expect(route.request().method()).toBe('PUT');
            expect(route.request().postDataJSON()).toMatchObject(loginReq);
            await route.fulfill({ json: loginRes });
        });
    }

    async register(page) {
        await page.route('*/**/api/auth', async (route) => {
            if (route.request().method() !== 'POST') {
                return route.fallback();
            }
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
            if (route.request().method() !== 'DELETE') {
                return route.fallback();
            }
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

    async addFranchise(page) {
        await page.route('*/**/api/franchise', async (route) => {
            if (route.request().method() !== 'POST') {
                return route.fallback();
            }
            expect(route.request().method()).toBe('POST');
            const franchiseReq = { name: "pizzaTest", admins: [{ email: "f@jwt.com" }] };
            const franchiseRes = { name: 'pizzaTest', admins: [{ email: 'f@jwt.com', id: 4, name: 'pizza franchisee' }], id: 1 };

            expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
            this.franchises.push({ id: 5, name: 'pizzaTest', stores: [], admins: [{ email: 'f@jwt.com', id: 4, name: 'pizza franchisee' }] });
            await route.fulfill({ json: franchiseRes });
        });
    }

    async addStore(page) {
        await page.route(/\/api\/franchise\/\d+\/store\/?$/, async (route) => {
            if (route.request().method() !== 'POST') {
                return route.fallback();
            }
            expect(route.request().method()).toBe('POST');
            const url = new URL(route.request().url());
            const folders = url.pathname.split("/");
            if (folders[folders.length - 1] == "store") {
                const forFranchise = folders[folders.length - 2];
                const franchiseReq = { name: "vineyard" };
                const franchiseRes = { id: 2, name: 'vineyard', totalRevenue: 0 };
                expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
                this.franchises.filter((f) => f.id == forFranchise)[0].stores.push(franchiseRes);
                await route.fulfill({ json: franchiseRes });
            }
        });
    }

    async getFranchises(page) {
        await page.route(/\/api\/franchise(?:\/[^?]*)?(?:\?.*)?$/, async (route) => {
            if (route.request().method() !== 'GET') {
                return route.fallback();
            }
            const url = new URL(route.request().url());
            const folders = url.pathname.split("/");
            const forUser = folders[folders.length - 1];
            const filters = [];
            if (/^\d+$/.test(forUser)) {
                filters.push((franchises) => franchises.filter((f) => {
                    if (f.admins == undefined) return false;
                    return f.admins.filter((admin) => admin.email == "f@jwt.com").length > 0;
                }));
            }
            const name = url.searchParams.get('name');
            const limit = url.searchParams.get('limit');
            let more = false;
            if (name) {
                const filter = name.replaceAll("*", "").toLowerCase();
                filters.push((franchises) => {
                    return franchises.filter((f) => f.name.toLowerCase().includes(filter));
                })
            }
            if (limit) {
                filters.push((franchises) => {
                    more = limit < franchises.length;
                    return franchises.slice(0, limit);
                })
            }
            let franchises = this.franchises;
            for (const filter of filters) franchises = filter(franchises);
            const franchiseRes = /^\d+$/.test(forUser) ? franchises : {
                franchises: franchises,
                more: more
            };

            expect(route.request().method()).toBe('GET');
            await route.fulfill({ json: franchiseRes });
        });
    }

    async deleteFranchise(page) {
        await page.route(/\/api\/franchise\/\d+\/?$/, async (route) => {
            if (route.request().method() !== 'DELETE') {
                return route.fallback();
            }
            const url = new URL(route.request().url());
            const folders = url.pathname.split("/");
            const forFranchise = folders[folders.length - 1];

            const franchiseRes = { message: 'franchise deleted' };
            this.franchises = this.franchises.filter((f) => f.id != forFranchise);
            await route.fulfill({ json: franchiseRes });
        });
    }

    async deleteStore(page) {
        await page.route(/\/api\/franchise\/\d+\/store\/\d+\/?$/, async (route) => {
            if (route.request().method() !== 'DELETE') {
                return route.fallback();
            }
            const url = new URL(route.request().url());
            const folders = url.pathname.split("/");
            if (folders[folders.length - 2] == "store") {
                const forFranchise = folders[folders.length - 3];
                const forStore = folders[folders.length - 1];
                const franchiseRes = { message: 'store deleted' };
                const franchise = this.franchises.find((f) => f.id == forFranchise);

                franchise.stores = franchise.stores.filter((s) => s.id != forStore);
                await route.fulfill({ json: franchiseRes });
            }
        });
    }

    async basicInit(page) {
        await this.register(page);
        await this.getMenu(page);
        await this.getFranchises(page);
        await this.me(page);
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
                id: 1,
                jwt: "abcdef.abcdef.abcdef"
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