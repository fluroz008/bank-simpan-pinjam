import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }


function randomAmount(min: number = 50000, max: number = 5000000) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function main() {
  //seed user(teller)
  const rawUsers = [
    { name: "Doni Iskandar", email: "doni48@pt.mil.id", password: "rahasia123" },
    { name: "Umaya Lestari", email: "umaya@ud.web.id", password: "indonesia123" },
    { name: "Sajat Prayoga", email: "sajat78@cv.net", password: "sandi123" },
    { name: "Narkamudin", email: "narka99@hotmail.com", password: "masuk123" },
    { name: "Rachel Kusmawati", email: "rachelkusmawati@gmail.com", password: "admin123" },
  ];

  const users = await Promise.all(
    rawUsers.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 12),
    }))
  );

  await prisma.user.createMany({ data: users });

  // Seed customers
  const customers = [
    { fullName: "Kezia Wijayanti", address: "Jl. Kendalsari No. 0, Bandung, Kalimantan Selatan 40955", birthDate: new Date("2000-07-21"), nik: "0433218196001338" },
    { fullName: "Vanesa Situmorang, M.Pd", address: "Jl. Pasir Koja No. 773, Mojokerto, Papua 75284", birthDate: new Date("1999-12-04"), nik: "9083863794026542" },
    { fullName: "Diana Prasetya, S.I.Kom", address: "Gang Laswi No. 6, Medan, Sulawesi Tengah 40912", birthDate: new Date("1972-10-15"), nik: "3511615594078161" },
    { fullName: "Respati Wibowo", address: "Jl. Rawamangun No. 49, Padangpanjang, JT 52998", birthDate: new Date("1978-06-29"), nik: "8495931034131647" },
    { fullName: "Sakura Pertiwi", address: "Jl. Moch. Ramdan No. 7, Bandar Lampung, JA 48450", birthDate: new Date("1967-05-27"), nik: "5255341928327648" },
    { fullName: "Betania Narpati, M.Farm", address: "Jl. Erlangga No. 044, Yogyakarta, Sulawesi Selatan 01980", birthDate: new Date("1935-02-24"), nik: "3503056413953767" },
    { fullName: "Dr. Ade Siregar", address: "Jalan Astana Anyar No. 99, Kediri, SU 75724", birthDate: new Date("1982-12-02"), nik: "2423884969653287" },
    { fullName: "Rina Siregar", address: "Jalan Cihampelas No. 5, Palopo, BT 10708", birthDate: new Date("1993-04-21"), nik: "1012269166978480" },
    { fullName: "Tami Samosir, M.Pd", address: "Gang Rawamangun No. 266, Tanjungpinang, SB 89932", birthDate: new Date("1983-04-23"), nik: "1845146270482814" },
    { fullName: "Wirda Riyanti", address: "Gg. Cikutra Timur No. 65, Semarang, NB 00616", birthDate: new Date("1990-06-11"), nik: "8932528809570154" },
  ];

  await prisma.customer.createMany({ data: customers });

  //seed transactions(50 total, deposit first before withdraw)
  const transactions = [];
  const startDate = new Date("2010-01-01");
  const endDate = new Date();
  const customerBalances: number[] = new Array(customers.length).fill(0);
  const customerDeposited: boolean[] = new Array(customers.length).fill(false);

  while (transactions.length < 50) {
    const createdCustomers = await prisma.customer.findMany();
    const createdUsers = await prisma.user.findMany();
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    const teller = createdUsers[Math.floor(Math.random() * createdUsers.length)];

    const customerId = customer.id;
    const tellerId = teller.id;
    const tellerName = teller.name;

    let status: "Deposit" | "Withdraw";
    let amount = randomAmount();

    if (!customerDeposited[customerId]) {
      status = "Deposit";
      customerBalances[customerId] += amount;
      customerDeposited[customerId] = true;
    } else {
      const doWithdraw = Math.random() < 0.5;

      if (doWithdraw && customerBalances[customerId] > 0) {
        if (amount > customerBalances[customerId]) {
          amount = customerBalances[customerId];
        }

        if (amount === 0) continue;

        status = "Withdraw";
        customerBalances[customerId] -= amount;
      } else {
        status = "Deposit";
        customerBalances[customerId] += amount;
      }
    }

    transactions.push({
      customerId,
      tellerId,
      tellerName,
      status,
      amount,
      createdAt: randomDate(startDate, endDate),
    });
  }
  
  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });