import { assert } from "../../../deps.js";
import { usergameDB } from "./commandDB.js";

Deno.test("User Command Testing", async (t) => {
    await t.step("Creating a Command", () => {
	const success = usergameDB.createCommand(
	    "TestUser",
	    "printHello",
	    `print("hello")`
	);
	assert(success);
    });

    await t.step("Searching for Command", () => {
	const res = usergameDB.searchCommand(
	    "TestUser",
	    "printHello",
	);
	assert(res.length == 1);
    });    
    
    await t.step("Updating a Command", () => {
	const success = usergameDB.updateCommand(
	    "TestUser",
	    "printHello",
	    `print("goodbye")`
	);
	assert(success);
    });

    await t.step("Create an existing Command", () => {
	const success = usergameDB.createCommand(
	    "TestUser",
	    "printHello",
	    `print("nihil")`
	);
	assert(!success);
    });

    await t.step("Updating a non-existent Command", () => {
	const success = usergameDB.updateCommand(
	    "TestUser",
	    "noway",
	    `print("goodbye")`
	);
	assert(!success);
    });

    await t.step("Run a Command", async () => {
	const res = await usergameDB.runCommand(
	    "printHello"
	);
	console.log(res);
	assert(res.content == "goodbye");
    });

    await t.step("Create a second Command", () => {
	const success = usergameDB.createCommand(
	    "TestUser",
	    "echo",
	    `print(input())`
	);
	assert(success);
    });

    await t.step("Query all Commands", () => {
	const res = usergameDB.searchCommand();
	console.log(res)
	assert(res.length == 2);
    });

    await t.step("Run Command With Input", async () => {
	const res = await usergameDB.runCommand(
	    "echo",
	    "hello"
	);
	console.log(res);
	assert(res.content == "hello");
    });

    await t.step("Run Command With Input That Doesn't Use It", async () => {
	const res = await usergameDB.runCommand(
	    "printHello",
	    "hello"
	);
	console.log(res);
	assert(res.content == "goodbye");
    });
    
    await t.step("Delete a Command", () => {
	usergameDB.deleteCommand(
	    "TestUser",
	    "printHello"
	);
	const res = usergameDB.searchCommand("TestUser", "printHello")
	assert(res.length == 1);
    });

    await t.step("Create and run Command With Files", async () => {
	usergameDB.createCommand(
	    "TestUser",
	    "file",
	    `with open("/out/test.txt","w") as f:
	      f.write("aaaa")`
	);
	const res = await usergameDB.runCommand("file");
	console.log(res);
	assert(res.file[0].blob.size == 4);
    });

});
