import { collection, getDocs, limit, orderBy, query, updateDoc, where } from "@/server/firestore";
import { db } from "@/server/db";
import { getSessionUserId } from "@/server/authorization";
import { genericErrorMessage, genericErrorStatus } from "@/server/http";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const notificationQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    const snapshot = await getDocs(notificationQuery);

    await Promise.all(snapshot.docs.map((item) => updateDoc(item.ref, { status: "open" })));
    const data = snapshot.docs.map((item) => ({ ...item.data(), id: item.id, status: "open" }));

    return NextResponse.json({ data, message: "Successfully retrieved notifications" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: null, message: genericErrorMessage(error) },
      { status: genericErrorStatus(error) },
    );
  }
}
