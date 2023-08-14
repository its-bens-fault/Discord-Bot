import { logger } from "../../logger.js";

export async function runBQN(code) {
    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const bqnCommand = new Deno.Command("cbqn", {
	stderr: "piped",
	stdout: "piped",
	stdin: "piped"
    });
    const bqn = bqnCommand.spawn();

    logger.info(`Received code: ${code}`,"libBQN");

    const bqnin = await bqn.stdin.getWriter();
    const bytes = enc.encode(code);
    let i = 0;
    let n = 0;
    do {
	n = await bqnin.write(bytes.slice(i));
	i += n;
    } while(n)
	await bqnin.close();
    const bqnout = await bqn.output();
    const output = bqnout.stdout;

    return dec.decode(output).trimEnd();
}
