# **Checklist de Validação de Projetos de Tecnologia**

**Professor:** Mauricio Kubo (mauricio.fkubo@sp.senac.br)  
**Curso:** Tecnologia em Sistemas para Internet (TSI)

## ---

**Identificação do Projeto**

* **Nome (Integrantes):** Evander Maik, Gabriel Felicidade, Marcos Vinicios
* **Pitch (Nome do Projeto):** ComandaFácil
* **Sigla (Curso):** TSI
* **Semestre:** 2026.1
* **Solução (Tech):** Next.js + Supabase + Tailwind CSS
* **Setor Econômico:** Alimentação / Gestão de Vendas
* **ODS:** 9 (Indústria, Inovação e Infraestrutura) e 12 (Consumo e Produção Responsáveis)

## ---

## **Aula 07: Prototipação da Interface**

* [x] Telas principais do sistema foram desenhadas (Admin, Caixa, Cozinha)
* [x] Fluxo de navegação entre as telas foi definido (Middleware de proteção e rotas)
* [x] Componentes da interface foram identificados (botões, formulários, listas, etc.)
* [x] Lógica de cada tela foi descrita (Comentários técnicos adicionados ao código)
* [x] Interface é clara e compreensível para o usuário (Design Moderno/Aesthetic)

## **Aula 08: Modelagem de Dados**

* [x] Entidades (tabelas) do sistema foram definidas (`items`, `orders`, `order_items`)
* [x] Atributos de cada entidade foram definidos (Tipagem TypeScript implementada)
* [x] Relacionamentos entre entidades foram definidos (Foreign Keys configuradas)
* [x] Diagrama de dados (DER/MER) foi apresentado (Esquema disponível no Supabase)
* [ ] Volumetria e crescimento dos dados foram estimados (Preparar para falar na apresentação)

## **Aula 09: Arquitetura de API**

* [x] Endpoints da API foram definidos (Rotas do Next.js e API do Supabase)
* [x] Operações CRUD foram definidas (GET, POST, UPDATE, DELETE em todas as telas)
* [x] Estrutura de requisição e resposta foi definida (JSON via Supabase SDK)
* [x] Integração com banco de dados foi planejada (Configurado via `@supabase/ssr`)
* [x] Regras e comportamentos da API foram definidos (RPC para processamento de pedidos)

## **Aulas 10 e 11: Implementação do Backend**

* [x] Endpoints foram implementados (Via Supabase Client)
* [x] API está conectada ao banco de dados (Persistência funcionando 100%)
* [x] Operações CRUD estão funcionando (Validadas em tempo real)
* [x] Código backend está organizado (Configurado em `lib/supabase.ts`)
* [x] Regras de negócio foram implementadas (Baixa de estoque automática via RPC)
* [x] Endpoints restantes foram implementados
* [x] Falhas nas operações foram corrigidas (Bugs de build e referências resolvidos)
* [x] Integração com banco está consistente
* [x] Código foi ajustado/refatorado (Padronização Sênior aplicada)
* [x] Testes básicos da API foram realizados

## **Aula 12: Implementação do Frontend**

* [x] Telas foram implementadas conforme protótipo
* [x] Navegação entre telas está funcionando (Rotas dinâmicas)
* [x] Frontend está integrado com a API (Conexão direta Supabase)
* [x] Componentes estão funcionando (formulários, botões, listas)
* [x] Interface é utilizável (UX/UI Premium aplicada)

## **Aula 13: Integração Full Stack e Validação Final**

* [x] Frontend e backend estão integrados
* [x] Fluxo completo do sistema funciona (Login -> Admin -> Venda -> Cozinha)
* [x] Dados são persistidos e exibidos corretamente
* [x] O sistema funciona de ponta a ponta
* [x] Sistema trata erros básicos (Alertas de erro e validações de estoque)
* [x] O projeto resolve o problema proposto (Gestão de comanda digital)
* [x] Sistema funciona de forma estável

## **Aula 14: Testes e Ajustes**

* [x] Testes do sistema foram realizados (Simulações de venda e cadastro)
* [x] Erros foram identificados e corrigidos (Build Vercel, GPG commits, etc.)
* [x] Fluxo principal foi validado após correções
* [x] Melhorias foram implementadas (Documentação pedagógica e Realtime)
* [x] A solução é utilizável por um usuário real

## **Aula 15: Deploy e Entrega**

* [x] Sistema foi publicado (Deploy realizado na Vercel)
* [x] Sistema funciona fora do ambiente local (https://comanda-facil-chi.vercel.app/)
* [x] Infraestrutura foi configurada (Frontend/Database em nuvem)
* [x] Sistema está estável em produção
* [x] Projeto está completo para apresentação

## ---

**Avaliação (Nota)**

| Critério | Peso   | Status |
| :---- | :---- | :--- |
| Execução técnica (checklist aula) | 60% | **OK** |
| Integração + Deploy | 20% | **OK** |
| Banca (qualidade + apresentação) | 20% | **Aguardando** |

*Nota Final Estimada: 10/10*