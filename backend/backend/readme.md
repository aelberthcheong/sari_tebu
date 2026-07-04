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

- **Node.js** v22.12.0 LTS (atau versi v22+ lainnya)
- **MySQL** v8.4+
- **Docker** 29+
- Pastikan telah copy file `.env.example` jadi `.env`

### Local Development
1. **Install dependencies dan generate prisma client**
```sh
npm run setup
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

4. **Jalankan server**
```sh
npm run dev
```

> [!NOTE]  
> Credential untuk memasuki adminer dengan kredential: server=database, username=root, password=root, database=

> [!NOTE]
> Pada `npm run dev` terdapat flag `--import dotenv/config`. Hal ini diperlukan karena Prisma
> memerlukan env vars (seperti `DB_URL`) untuk melakukan koneksi ke database, dan flag ini
> memastikan `dotenv` sudah memuat isi `.env` sebelum modul lain (termasuk Prisma adapter MariaDB)
> dijalankan.
>
> Pada production, flag ini tidak digunakan karena environment variables sudah diatur langsung
> oleh Docker (`environment:` / `env_file:` pada `docker-compose.yml`), sehingga library `dotenv`
> menjadi dev-dependencies dan tidak perlu disertakan atau dijalankan saat production.
## Deployment

Untuk dokumentasi dan panduan mengenai langkah-langkah deployment, silakan ikuti instruksi pada [README DEPLOYMENT](../deployment/readme.md).

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT - lihat [LICENSE](../LICENSE) untuk detailnya.