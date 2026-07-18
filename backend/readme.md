# Sari Tebu's Backend

> [!IMPORTANT]
> Proyek ini dibuat untuk tujuan pembelajaran. Walaupun kami berusaha mengikuti industry standard, kami 
> merekomendasikan Anda untuk tidak menggunakan proyek ini sebagai basis production, atau
> membawakan ekspektasi berlebihan terhadap proyek ini untuk saat ini

Sari Tebu merupakan aplikasi POS (*Point of Sale*) berbasis web. Frontend akan di render sisi klien (*Client-Side Rendering* / CSR) dikarenakan ini merupakan aplikasi *dashboard*, di mana SEO (*Search Engine Optimization*) tidak berperan penting.

Backend ini berjalan di atas runtime Node.js dengan framework Express, beserta prisma ORM (*Object Relational Mapper*). Authentikasi dengan Berbasis server-side session token dibantu oleh Bcrypt dan OTP oleh Resend.

| Node | Express | MySQL | Prisma | Docker | Resend |
|:----:|:-------:|:-----:|:------:|:------:|:------:|
| <a href="https://nodejs.org"><img height="128" width="128" src="./assets/node.js.svg" alt="Node.js" style="padding: 5px; border-radius: 4px;" /></a> | <a href="https://expressjs.com"><img height="128" width="128" src="./assets/express.svg" alt="Express" style="padding: 5px; border-radius: 4px;" /></a> | <a href="https://www.mysql.com"><img height="128" width="128" src="./assets/mysql.svg" alt="Mysql" style="padding: 5px; border-radius: 4px;" /></a> | <a href="https://www.prisma.io/"><img height="128" width="128" src="./assets/prisma.svg" alt="Prisma" style="padding: 5px; border-radius: 4px;" /></a> | <a href="https://www.docker.com/"><img height="128" width="128" src="./assets/docker.svg" alt="Docker" style="padding: 5px; border-radius: 4px;" /></a> | <a href="https://resend.com/"><img height="128" width="128" src="./assets/resend.svg" alt="Resend" style="padding: 5px; border-radius: 4px;" /></a> |

## Installation

### Prerequisites

- **Node.js** v26.0.0+
- **MySQL** v8.4+
- **Docker** 29+
- Pastikan telah copy file `.env.example` jadi `.env`

### Local Development
1. **Install dependencies
```sh
npm run install 
```

2. **Build docker container**
```sh
docker compose up --build -d
```

3. **Setup prisma dan migrations**
```sh
npx prisma generate        // Generate prisma client
npx prisma migrate deploy  // Jalankan migration
```

4. **Jalankan development server**
```sh
npm run dev
```

> [!NOTE]  
> Anda dapatkan jalankan command `npx prisma studio` untuk membuka database editor bawaan Prisma
> Secara default akan dijalankan di http://localhost:51212

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT - lihat [LICENSE](../LICENSE) untuk detailnya.