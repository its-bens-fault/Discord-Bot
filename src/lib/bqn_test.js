import { assert } from "../../deps.js";
import { runBQN } from "./bqn.js";

Deno.test("BQN Test", async (t) => {
    await t.step("BQN Test Expression", async () => {
	const res = await runBQN("1+2");
	assert("   3" == res);
    });
});
