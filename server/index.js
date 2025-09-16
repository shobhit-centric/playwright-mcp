import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express and MCP Server
const app = express();
const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});


server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        }
    }
);


server.tool(
    "getLoginScenarios",
    "Fetch login scenarios and feature details from the feature file",
    {},
    async () => {
        const featurePath = path.resolve(__dirname, "../features/login.feature");
        const featureContent = fs.readFileSync(featurePath, "utf-8");
        
       
        const featureMatch = /Feature:\s*([^\n]+)/.exec(featureContent);
        const featureName = featureMatch ? featureMatch[1].trim() : "Unnamed Feature";
        
        
        const descriptionMatch = /Feature:[^\n]*\n((?:(?!Scenario:).*\n)*)/m.exec(featureContent);
        const description = descriptionMatch ? descriptionMatch[1].trim() : "";
        
        
        const scenarioBlocks = featureContent.split(/(?=(?:@|Scenario:|Example:))/g)
            .filter(block => block.includes('Scenario:') || block.includes('Example:'));
            
        const scenarios = scenarioBlocks.map(block => {
          
            const tags = [...block.matchAll(/@[\w-]+/g)].map(tag => tag[0]);
            
           
            const titleMatch = /Scenario:([^\n]*)/.exec(block);
            const title = titleMatch ? titleMatch[1].trim() : "";
            
        
            const stepLines = block.split('\n')
                .map(line => line.trim())
                .filter(line => /^(Given|When|Then|And|But)\s+/.test(line));
                
            const steps = stepLines.map(step => {
                const [type, ...rest] = step.split(/\s+/);
                return {
                    type: type,
                    text: rest.join(' ')
                };
            });
            
            
            const exampleMatch = /Examples?:([^@]*?)(?=(?:\n\s*@|\n\s*Scenario:|$))/s.exec(block);
            let examples = [];
            if (exampleMatch) {
                const tableLines = exampleMatch[1].trim().split('\n').map(line => line.trim());
                if (tableLines.length >= 2) {
                    const headers = tableLines[0].split('|').map(h => h.trim()).filter(Boolean);
                    examples = tableLines.slice(1)
                        .map(line => {
                            const values = line.split('|').map(v => v.trim()).filter(Boolean);
                            return headers.reduce((obj, header, i) => {
                                obj[header] = values[i];
                                return obj;
                            }, {});
                        });
                }
            }
            
            return {
                tags,
                title,
                steps: steps.map(s => `${s.type} ${s.text}`),
                examples: examples.length ? examples : undefined
            };
        });
        
        
        const formattedOutput = `Feature: ${featureName}
${description ? '\nDescription:\n' + description : ''}

${scenarios.map(scenario => `${scenario.tags.length ? scenario.tags.join(' ') + '\n' : ''}Scenario: ${scenario.title}
Steps:
${scenario.steps.map(step => '  - ' + step).join('\n')}
${scenario.examples ? '\nExamples:\n' + JSON.stringify(scenario.examples, null, 2) : ''}`).join('\n\n')}`;

        return {
            content: [
                {
                    type: "text",
                    text: scenarios.length ? formattedOutput : "No scenarios found."
                }
            ]
        };
    }
);

// Transport setup for multiple connections
const transports = {};

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
        delete transports[transport.sessionId];
    });
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

// Start the server
app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});
