import type { TrackId } from "../types/curriculum";

export interface ReferenceItem {
  syntax: string;
  description: string;
}

export const TRACK_REFERENCES: Record<TrackId, ReferenceItem[]> = {
  logic: [
    { syntax: 'var nome = "Ana"', description: "Declara uma variável na memória (aceita var, inteiro, texto, logico)." },
    { syntax: 'escreva("Olá,", nome)', description: "Imprime textos, variáveis e expressões no console." },
    { syntax: "e / ou / nao", description: "Operadores lógicos em português (equivalentes a &&, ||, !)." },
    { syntax: "se (cond) { ... } senao { ... }", description: "Estrutura condicional para desvio de fluxo." },
    { syntax: "se cond entao ... fimse", description: "Sintaxe clássica de bloco Portugol sem chaves." },
    { syntax: "enquanto (cond) { ... }", description: "Laço controlado por condição lógica." },
    { syntax: "para (var i = 1; i <= 5; i++)", description: "Laço com contador controlado (aceita também para i de 1 ate 5 faca)." },
    { syntax: "funcao dobro(x) { retorne x * 2 }", description: "Define função reutilizável com valor de retorno." },
  ],
  cpp: [
    { syntax: "#include <iostream>", description: "Importa fluxos padrão cout, cin e endl." },
    { syntax: "using namespace std;", description: "Evita repetir std:: antes dos comandos padrão." },
    { syntax: 'cout << "Texto" << endl;', description: "Imprime conteúdo no console e quebra linha." },
    { syntax: "cin >> x;", description: "Lê um valor do teclado (stdin) para a variável x." },
    { syntax: "cin.ignore(); getline(cin, s);", description: "Limpa o buffer após >> e lê linha com espaços." },
    { syntax: "fixed << setprecision(2)", description: "Formata decimais com exatas 2 casas (<iomanip>)." },
    { syntax: "vector<int> v; v.push_back(10);", description: "Cria vetor dinâmico e adiciona elemento (<vector>)." },
    { syntax: "for (int i = 0; i < n; i++)", description: "Laço de repetição controlado por índice." },
  ],
  js: [
    { syntax: "const x = 10; let y = 20;", description: "const para valores fixos; let para mutáveis." },
    { syntax: "`Olá, ${nome}!`", description: "Template string com interpolação de variáveis." },
    { syntax: "a === b", description: "Igualdade estrita (valor e tipo)." },
    { syntax: "const fn = x => x * 2;", description: "Arrow function com retorno implícito." },
    { syntax: "arr.filter(x => x > 0)", description: "Filtra elementos que satisfazem a condição." },
    { syntax: "arr.map(x => x * 2)", description: "Transforma cada item retornando um novo array." },
    { syntax: "arr.reduce((acc, v) => acc + v, 0)", description: "Reduz o array a um único resultado acumulado." },
    { syntax: "const { nome, preco } = obj;", description: "Desestruturação de propriedades de objeto." },
  ],
  python: [
    { syntax: 'print(f"{nome}: {nota:.1f}")', description: "Saída formatada com f-string e 1 casa decimal." },
    { syntax: "texto.strip().upper()", description: "Remove espaços das pontas e converte para maiúsculas." },
    { syntax: "lista[1:4] / lista[::-1]", description: "Fatiamento (slicing) e inversão de sequência." },
    { syntax: "for i in range(1, 11, 2):", description: "Itera de 1 até 10 pulando de 2 em 2." },
    { syntax: "[x * 2 for x in nums if x > 0]", description: "List comprehension com filtro condicional." },
    { syntax: "d.get('chave', 0)", description: "Lê chave de dicionário com valor padrão seguro." },
    { syntax: "def soma(a, b=0):", description: "Define função com parâmetro opcional padrão." },
    { syntax: "int(input())", description: "Lê linha da entrada padrão e converte para inteiro." },
  ],
  web: [
    { syntax: "<header>, <main>, <section>, <footer>", description: "Tags semânticas para organizar regiões reais da página HTML5." },
    { syntax: '<label for="nome"> + <input id="nome">', description: "Associa rótulo acessível ao campo de formulário." },
    { syntax: "box-sizing: border-box; padding: 16px;", description: "Controla o Box Model sem somar bordas e padding à largura total." },
    { syntax: "display: flex / display: grid", description: "Sistemas modernos de alinhamento e layout responsivo em CSS." },
    { syntax: "@media (max-width: 680px) { ... }", description: "Adapta colunas e estilos em telas menores." },
    { syntax: 'document.querySelector("#id")', description: "Seleciona elementos do DOM usando seletores CSS." },
    { syntax: 'el.textContent = "Novo" / el.classList.add("ativo")', description: "Atualiza texto e classes de estado no navegador." },
    { syntax: 'btn.addEventListener("click", fn)', description: "Escuta interações do usuário em botões e formulários." },
  ],
  linux: [
    { syntax: "pwd / ls -la / cd ~", description: "Confirma caminho atual, lista ocultos e volta para home." },
    { syntax: "mkdir -p pasta/sub", description: "Cria árvore de diretórios recursivamente." },
    { syntax: "cp origem dest / mv a b", description: "Copia ou move/renomeia arquivos e pastas." },
    { syntax: "grep -i -n 'erro' arquivo.log", description: "Busca padrão ignorando caixa e mostrando linhas." },
    { syntax: "cat a.csv | cut -d',' -f1 | sort | uniq", description: "Pipeline extrai coluna, ordena e deduplica." },
    { syntax: "chmod +x script.sh && ./script.sh", description: "Concede permissão de execução e roda o script." },
    { syntax: "ps aux / kill <PID>", description: "Lista processos ativos e encerra pelo PID." },
    { syntax: "tar -czf backup.tar.gz pasta/", description: "Compacta diretório em arquivo .tar.gz." },
  ],
  networks: [
    { syntax: "ip a / ip route", description: "Inspeciona interfaces IPv4 e tabela de roteamento." },
    { syntax: "ping <ip|host>", description: "Testa alcançabilidade ICMP e latência." },
    { syntax: "traceroute <ip|host>", description: "Exibe todos os saltos de rede até o destino." },
    { syntax: "nslookup <hostname>", description: "Consulta resolução de nomes DNS interna." },
    { syntax: "test-acl <ip> <proto> <porta>", description: "Simula passagem pelo Firewall-DMZ." },
    { syntax: "Rede = IP AND Máscara", description: "Calcula endereço de rede bit a bit." },
    { syntax: "Hosts úteis = 2^(32 - CIDR) - 2", description: "Calcula endereços atribuíveis em uma sub-rede." },
  ],
  database: [
    { syntax: "SELECT col1, col2 FROM tabela;", description: "Consulta colunas específicas de uma tabela." },
    { syntax: "WHERE cond1 AND cond2", description: "Filtra linhas antes do agrupamento." },
    { syntax: "ORDER BY col DESC LIMIT 5;", description: "Ordena decrescente e limita aos 5 primeiros." },
    { syntax: "GROUP BY col HAVING COUNT(*) > 1", description: "Agrupa registros e filtra grupos agregados." },
    { syntax: "INNER JOIN t2 ON t2.id = t1.fk", description: "Relaciona registros correspondentes entre tabelas." },
    { syntax: "LEFT JOIN t2 ON ... WHERE t2.id IS NULL", description: "Encontra registros sem correspondência." },
    { syntax: "CREATE TABLE t (id INTEGER PRIMARY KEY);", description: "Cria nova tabela relacional." },
    { syntax: "INSERT INTO t VALUES (...);", description: "Insere novos registros na tabela." },
  ],
};

export const KEYBOARD_SHORTCUTS = [
  { keys: ["Ctrl", "Enter"], action: "Executar código, prévia Web ou consulta SQL" },
  { keys: ["Tab"], action: "Indentar seleção / Autocompletar no terminal" },
  { keys: ["↑", "↓"], action: "Navegar no histórico de comandos do terminal" },
  { keys: ["Ctrl", "F"], action: "Buscar texto dentro do editor de código" },
  { keys: ["Ctrl", "L"], action: "Limpar saída do terminal Linux / Redes" },
];
