const games = {};

// Unicode is rather large
const bufSize = 5000;

const dec = new TextDecoder();
const enc = new TextEncoder();

export async function make(name, computer, lvl) {
    const args = ["-q","-g"];
    if (!computer)
	args.push("-m");
    const chessCommand = new Deno.Command("gnuchess", {
	args,
	stderr: "piped",
	stdout: "piped",
	stdin: "piped"
    });
    games[name] = await chessCommand.spawn()
    await waitOut(name);
    const level = lvl?lvl:0;
    await input(name, `depth ${level}`);
    await input(name, "coords");
}

export async function close(name) {
    const p = games[name];
    await p.stdin.close()
    await p.stdout.cancel()
    await p.stderr.cancel()
    await p.kill();
    await p.status;
    delete games[name];
}

export function exists(name) {
    return name in games;
}

function isInputLine(buf) {
    const lines = dec.decode(buf).split('\n');
    const last = lines[lines.length-1];
    return last.match(/^(White|Black)[^:]*: /)!=null;
}

async function waitOut(name) {
    const game = games[name];
    const buffer = new Uint8Array(bufSize);
    const gameout = await game.stdout.getReader({mode:"byob"});
    let d;
    let i = 0;
    do {
	d = new Uint8Array(1);
	const c = (await gameout.read(d)).value;
	buffer[i] = c[0];
	i+=1;
    } while (i < bufSize && !isInputLine(buffer))
	const txt = dec.decode(buffer);
    gameout.releaseLock()
    return txt;
}

async function input(name,txt) {
    const game = games[name];
    const gamein = await game.stdin.getWriter();
    await gamein.write(enc.encode(`${txt}\n`));
    await gamein.releaseLock()
    return await waitOut(name);
}

export async function play(name, move) {
    const output = await input(name,move);
    return output;
}

export async function state(name) {
    const output = await input(name,"show board");
    return output;
}

export async function board(name) {
    const output = await state(name);
    const lines = output.split('\n');
    const len = lines.length;
    return lines.splice(len-10,len-3).join('\n');
}

export async function turn(name) {
    const state = await input(name);
    const match = state.match(/^(?:White|Black) \(([\d]+)\)/m);
    if (match?.length==2)
	return parseInt(match[1]);
    return undefined;
}

export async function color(name) {
    const state = await input(name);
    const match = state.match(/^(White|Black)/m);
    if (match?.length==2)
	return match[1];
    return undefined;
}

export function valid(res) {
    return res.match(/invalid/i) == null;
}

export function win(res) {
    return res.match(/mate/i) == null;
}
