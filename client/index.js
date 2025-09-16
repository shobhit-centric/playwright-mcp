import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import readline from 'readline';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
    renderer: new TerminalRenderer()
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = new Client({
    name: "example-client",
    version: "1.0.0"
});

// Connect to the MCP server
client.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")))
    .then(() => {
        console.log(marked("# Connected to MCP server\n"));
        chatLoop();
    });

async function chatLoop() {
    try {
        const input = await new Promise(resolve => {
            rl.question(marked('**Enter command** (add/scenarios): '), resolve);
        });

        if (input === 'add') {
            const numbers = await new Promise(resolve => {
                rl.question(marked('**Enter two numbers** (e.g., 5 7): '), resolve);
            });
            const [a, b] = numbers.split(' ').map(Number);
            const result = await client.callTool({
                name: "addTwoNumbers",
                arguments: { a, b }
            });
            console.log(marked(`\n> ${result.content[0].text}\n`));
        } 
        else if (input === 'scenarios') {
            const result = await client.callTool({
                name: "getLoginScenarios",
                arguments: {}
            });
            console.log(marked(`\n### Login Scenarios\n${result.content[0].text}\n`));
        }
        else {
            console.log(marked('\n❌ Invalid command. Use `add` or `scenarios`\n'));
        }
        
        chatLoop();
    } catch (error) {
        console.error(marked(`\n❌ **Error:** ${error.message}\n`));
        chatLoop();
    }
}

// Handle cleanup
process.on('SIGINT', () => {
    rl.close();
    process.exit();
});
