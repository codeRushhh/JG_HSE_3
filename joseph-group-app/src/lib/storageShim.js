// storageShim.js
//
// This file replaces `window.storage`, which only exists inside Claude.ai's
// artifact preview sandbox. Every screen in this app (Login, Dashboard, and
// all 11 inspection modules) calls window.storage.get/set/delete/list — this
// shim makes those exact same calls work in a normal deployed website by
// backing them with the SAME shared Supabase project used by the JGM and
// JA Installation apps in this merged portal.
//
// NAMESPACING: every key this app writes is prefixed "jg:" so its data can
// never collide with JGM's ("jgm:") or JA Installation's ("ja:") data inside
// the same shared kv_store table.
//
// This means Joseph Group reports are now shared across every device/phone
// automatically — no more "Sayed's phone doesn't see Sharan's phone" issue.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const APP_NS = "jg:";

let sb = null;
let dbReady = false;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    dbReady = true;
  }
} catch (e) {
  console.error("Supabase init failed", e);
  dbReady = false;
}

const storageShim = {
  async get(key, shared = false) {
    if (!dbReady) return null;
    try {
      const { data, error } = await sb
        .from("kv_store")
        .select("value")
        .eq("key", APP_NS + key)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { key, value: data.value, shared };
    } catch (e) {
      console.error("storage.get failed", key, e);
      return null;
    }
  },

  async set(key, value, shared = false) {
    if (!dbReady) return null;
    try {
      const { error } = await sb.from("kv_store").upsert({
        key: APP_NS + key,
        value,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return { key, value, shared };
    } catch (e) {
      console.error("storage.set failed", key, e);
      return null;
    }
  },

  async delete(key, shared = false) {
    if (!dbReady) return null;
    try {
      const { error } = await sb.from("kv_store").delete().eq("key", APP_NS + key);
      if (error) throw error;
      return { key, deleted: true, shared };
    } catch (e) {
      console.error("storage.delete failed", key, e);
      return null;
    }
  },

  async list(prefix = "", shared = false) {
    if (!dbReady) return { keys: [], prefix, shared };
    try {
      const { data, error } = await sb
        .from("kv_store")
        .select("key")
        .like("key", APP_NS + prefix + "%");
      if (error) throw error;
      const keys = (data || []).map((r) => r.key.slice(APP_NS.length));
      return { keys, prefix, shared };
    } catch (e) {
      console.error("storage.list failed", prefix, e);
      return { keys: [], prefix, shared };
    }
  },
};

// Install the shim globally so every existing component's window.storage
// calls work unmodified.
if (typeof window !== "undefined") {
  window.storage = storageShim;
}

export default storageShim;
