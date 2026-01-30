// Lê o arquivo .env na raiz do projeto
import 'dotenv/config'; 
import express from 'express'; // framework do servidor web
import cors from 'cors'; // permite que o Frontend acesse o Backend
import { PrismaClient, Category, Purchase } from '@prisma/client';
// Importações específicas para o "Adapter" do PostgreSQL
// O 'pg' é o driver oficial do node para Postgres.
// O 'PrismaPg' é a "ponte" que faz o Prisma conversar com esse driver.
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';


const app = express();
const PORT = 3000;
// URL que está no .env
const connectionString = process.env.DATABASE_URL;

// Criando um pool de conexões com o banco de dados Postgres com recursividade
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

app.use(express.json());
app.use(cors());

// quando o frontend chamar essa rota, o backend vai responder com os dados do dashboard
app.get('/dashboard', async (req, res) => {
    try {
        // 1. Total Gasto (Soma de tudo)
        const totalAggregation = await prisma.purchase.aggregate({
            _sum: { value: true },
            _count: { idPurchase: true },
        });
        // 2. Gastos por Categoria (Para o gráfico de Pizza)
        const byCategory = await prisma.purchase.groupBy({
            by: ['categoryId'],
            _sum: { value: true },
        });
        const categories = await prisma.category.findMany();

        // Arrays vazios que vamos preencher para mandar pro Frontend
        const pieSeries: number[] = [];
        const pieLabels: string[] = [];
        const pieColors: string[] = [];
        
        byCategory.forEach((item: any) => {
           /*  (c: Category) => ... (A Função de Callback)
            Isso é uma Arrow Function (função flecha). Ela é executada repetidamente para cada item da lista.
            c: Representa o item atual da iteração. Na primeira volta, c é a Categoria 0; na segunda, é a Categoria 1, etc.
            : Category: É apenas a "etiqueta" do TypeScript para garantir que o computador saiba que c tem propriedades como description e idCategory.*/
            const cat = categories.find((c: Category) => c.idCategory === item.categoryId);
            if (item._sum.value) {
                pieSeries.push(item._sum.value);
                pieLabels.push(cat?.description || 'Outros');
                pieColors.push(cat?.color || '#CBD5E1');
            }
        });

        const purchases = await prisma.purchase.findMany({
            orderBy: { date: 'asc' },
            take: 50,
        });

        const lineSeries = [{
            name: 'Gastos',
            data: purchases.map((p: Purchase) => p.value),
        }];
        const lineCategories = purchases.map((p: Purchase) => new Date(p.date).toLocaleDateString('pt-BR'));
        res.json({
            total: totalAggregation._sum.value || 0,
            count: totalAggregation._count.idPurchase || 0,
            ticketMedio: (totalAggregation._sum.value || 0) / (totalAggregation._count.idPurchase || 1),
            pieChart: { series: pieSeries, labels: pieLabels, colors: pieColors },
            lineChart: { series: lineSeries, categories: lineCategories },
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));