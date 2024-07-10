"use strict";
const debug = require("debug")("ModelSequence");
const Model = require("./Model");
const ModelDB = require("./ModelDB");

class ModelSequence extends Model {
  // Constructor
  constructor(data) {
    super();
    this.seq_id = data.seq_id;
    this.ex_id = data.ex_id;
    this.rank = data.rank;
    this.min_rating = data.min_rating;
    this.p_id = data.p_id;
    this.description = data.description;

    // Reference to generic model global variable
    this.dbName = ModelSequence.dbName;
    this.keys = ModelSequence.keys;
    this.locKey = ModelSequence.locKey;
  }

  static async read(seq_id) {
    debug("Get the sequence with the id "+seq_id);
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT * FROM " + ModelSequence.dbName + " WHERE seq_id=$1::int and rank>0 ORDER BY rank;";
      const tabEx = await client.query(sql, [seq_id]);
      debug("read sequence : got answer from db");
      //debug(tabEx);
      if (tabEx.rowCount == 0) {
        debug("non existing of empty sequence");
        return null
      }
      else {return tabEx.rows; }
      // return tabEx.rows; // can be [] if no tuple found for this seq_id
    } catch (err) {
      debug("read sequence : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async getAllExercises(seq_id) {
    debug("Get all exercise for a sequence list");
    const client = await ModelDB.connect_to_db();
    try {
      const sql =
        "SELECT ex_id, min_rating, rank FROM " +
        ModelSequence.dbName +
        " WHERE seq_id=$1::int ORDER BY rank;";
      const tabEx = await client.query(sql, [seq_id]);
      debug("getAllExercices: SUCCESS");
      return tabEx.rows;
    } catch (err) {
      debug("getAllExercices: " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async getAllSequences() {
    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    debug("Get all sequence");
    const ids = await this.getAllSequencesId();
    let tabSeq = new Map();
    let cpt = 0;
    ids.forEach(async (item, index, array) => {
      call(item, this.getAllExercises, tabSeq);
    });

    while (cpt !== ids.size) {
      await sleep(500);
      return tabSeq;
    }

    async function call(item, getAllExercises, tabSeq) {
      let seq = await getAllExercises(item.seq_id).catch((err) => console.log(err));
      tabSeq.set(
        Object.assign({}, { seq_id: item.seq_id, description: item.description, p_id: item.p_id }),
        seq
      );
      cpt++;
      if (cpt === ids.length) {
        return tabSeq;
      }
    }
  }

  static async getAllSequencesId() {
    debug("Get all sequence Ids");
    const client = await ModelDB.connect_to_db();
    try {
      const sql =
        "SELECT DISTINCT seq_id, description, p_id FROM " + ModelSequence.dbName + " ORDER BY seq_id;";
      const tabEx = await client.query(sql, []);
      debug("getAllSequenceId: SUCCESS");
      return tabEx.rows;
    } catch (err) {
      debug("getAllSequenceId: " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }
}

ModelSequence.dbName = "SequenceList"; //Sequence
ModelSequence.keys = [
  ["seq_id", "int"], // Primary key first
  ["ex_id", "int"],
  ["rank", "int"],
  ["min_rating", "decimal(4,2)"],
  ["p_id", "int"],
  ["description", "text"],
];
ModelSequence.locKey = undefined;

module.exports = ModelSequence;
