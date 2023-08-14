import { assert } from "../../../deps.js";
import * as chess from "./chess.js";


Deno.test("Chess Testing", async (t) => {
    await t.step("Chess Input Test", async () => {
	const n = "Input Test";
	await chess.make(n);
	await chess.play(n,"a4");
	await chess.play(n,"h6");
	const board = await chess.board(n);
	await chess.close(n);
	const expect = await Deno.readTextFile("./src/lib/chess/expectedboard.txt");
	console.log(board);
	console.log("vs");
	console.log(expect);
	assert(board == expect);
    });
    await t.step("Chess Bad Move", async () => {
	const n = "Bad Move";
	await chess.make(n);
	const res = chess.valid(await chess.play(n,"a7"));
	await chess.close(n);
	assert(res == false);
    });
    await t.step("Chess Win", async () => {
	const n = "Win Chess";
	await chess.make(n);
	await chess.play(n, "pgnload ./src/lib/chess/win.pgn");
	const res = chess.win(await chess.play(n,"c4#"));
	await chess.close(n);
	assert(res == true);
    });
    await t.step("Chess State", async () => {
	const n = "State";
	await chess.make(n);
	const res = await chess.state(n);
	await chess.close(n);
	assert(res.length == 4936);
    });
    await t.step("Get Chess Turn", async () => {
	const n = "Turn";
	await chess.make(n);
	const res = await chess.turn(n);
	console.log(res);
	await chess.close(n);
	assert(res == 1);
    });
    await t.step("Get Chess Color", async () => {
	const n = "Color";
	await chess.make(n);
	const res = await chess.color(n);
	console.log(res);
	await chess.close(n);
	assert(res == "White");
    });
});
