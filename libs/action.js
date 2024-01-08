const { axiosInstance, shopeeCreatorApi } = require("./api");
const Table = require("cli-table");
const axios = require("axios");
const fs = require("fs");

class Action {
	constructor() {
		this.axiosInstance = axiosInstance;
		this.shopeeCreatorApi = shopeeCreatorApi;
		this.session = "";
	}

	get sessionID() {
		return this.session;
	}

	set sessionID(session) {
		this.session = session;
	}

	async getSession() {
		return await shopeeCreatorApi
			.get(
				"https://creator.shopee.co.id/supply/api/lm/sellercenter/realtime/sessionList?page=1&pageSize=10&name="
			)
			.then((response) => {
				return response.data.data.list[0].sessionId;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	getVochers = () => {
		return axiosInstance
			.get(`/session/${this.session}/voucher?scene=0`)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				return null;
			});
	};

	checkAccountInfo = async () => {
		return await shopeeCreatorApi
			.get("https://creator.shopee.co.id/supply/api/lm/sellercenter/userInfo")
			.then((response) => {
				return response.data.data;
			})
			.catch((error) => {
				console.log(error);
			});
	};

	pinItem = (data) => {
		return axiosInstance
			.post(`/session/${this.session}/show`, data)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.log(error);
			});
	};

	doAuction = (data) => {
		return axiosInstance
			.post(`/auction/session/${this.session}/start`, data)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.log(error);
			});
	};

	getRequestedItems = () => {
		return axiosInstance
			.get(`/session/${this.session}/asked_items?ctx_id=&offset=0&limit=100`)
			.then((response) => {
				return response.data.data.items;
			})
			.catch((error) => {
				console.log(error);
			});
	};

	showVoucher = (data) => {
		return axiosInstance
			.post(`/session/${this.session}/voucher/show`, data)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.log(error);
			});
	};

	getSales = () => {
		return shopeeCreatorApi
			.get(
				`https://creator.shopee.co.id/supply/api/lm/sellercenter/realtime/dashboard/productList?sessionId=${this.session}&productName=&productListTimeRange=0&productListOrderBy=productClicks&sort=desc&page=1&pageSize=100`
			)
			.then(async (response) => {
				let data = response.data.data.list.filter(
					(product) => product.itemSold > 0
				);

				data.sort((a, b) => b.revenue - a.revenue);

				var table = new Table({
					head: ["ID", "Product Name", "Total Sold", "Total Revenue"],
					colWidths: [15, 30, 10, 20],
				});

				table.push(
					...data.map((product) => [
						product.itemId,
						product.title,
						product.itemSold,
						new Intl.NumberFormat("id-ID", {
							style: "currency",
							currency: "IDR",
						}).format(product.revenue),
					])
				);

				console.log(table.toString());

				var totalSold = data.reduce(
					(total, product) => total + product.itemSold,
					0
				);
				var totalRevenue = data.reduce(
					(total, product) => total + product.revenue,
					0
				);

				console.log(`Total Sold: ${totalSold}`);
				console.log(
					`Total Revenue: ${new Intl.NumberFormat("id-ID", {
						style: "currency",
						currency: "IDR",
					}).format(totalRevenue)}`
				);
			})
			.catch((error) => {
				console.log(error);
			});
	};
}

module.exports = Action;
