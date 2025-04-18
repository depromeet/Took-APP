import { router } from "expo-router";
import { saveCardToServer } from "../api/cardSave";

/**
 * 딥링크 처리를 위한 유틸리티 함수들
 */

// 이미 처리된 링크와 처리 중인 상태를 관리하는 전역 변수
const processedLinks = new Set<string>();
const savedCardIds = new Set<string>();
let isProcessingDeepLink = false;

/**
 * 딥링크 URL 처리 함수
 * @param url 처리할 딥링크 URL
 * @param setCardId 카드 ID를 Context에 저장하는 함수
 */
export async function handleDeepLink(
  url: string,
  setCardId: (id: string | null) => void,
) {
  if (!url) return;

  console.log("딥링크 수신:", url);

  // 중복 처리 방지
  if (isProcessingDeepLink) {
    console.log("이미 처리 중인 딥링크가 있습니다.");
    return;
  }

  // 프로토콜 제거 후 기본 경로 추출
  const plainPath = url.replace("took://", "");
  const baseUrl = plainPath.split("?")[0];

  // 이미 처리된 링크인지 확인
  if (processedLinks.has(baseUrl)) {
    console.log("이미 처리된 딥링크입니다:", baseUrl);
    return;
  }

  // 처리 시작
  isProcessingDeepLink = true;
  processedLinks.add(baseUrl);

  try {
    // 쿼리 파라미터 추출 (URL 객체를 사용하기 위해 임시 도메인 사용)
    const parsedUrl = new URL(`http://example.com/${plainPath}`);

    // 경로별 처리
    if (isInterestingRoute(baseUrl)) {
      await handleInterestingRoute();
    } else if (isNotesRoute(baseUrl)) {
      await handleNotesRoute(baseUrl, parsedUrl.searchParams);
    } else if (isCardShareRoute(baseUrl)) {
      await handleCardShareRoute(baseUrl, parsedUrl.searchParams, setCardId);
    } else if (isCardDetailRoute(baseUrl)) {
      await handleCardDetailRoute(baseUrl, parsedUrl.searchParams, setCardId);
    } else {
      // 매칭되는 경로가 없으면 기본 화면으로 이동
      console.log("매칭되는 경로가 없습니다:", baseUrl);
      router.replace("/(auth)" as any);
    }
  } catch (error) {
    console.error("딥링크 처리 중 오류 발생:", error);
    router.replace("/(auth)" as any);
  } finally {
    isProcessingDeepLink = false;
  }
}

/**
 * 경로 타입 확인 함수들
 */
function isInterestingRoute(path: string): boolean {
  return path === "received/interesting" || path === "received-interesting";
}

function isNotesRoute(path: string): boolean {
  return path === "card-notes" || path.startsWith("card-notes/");
}

function isCardShareRoute(path: string): boolean {
  return path.startsWith("card-share/");
}

function isCardDetailRoute(path: string): boolean {
  return path.startsWith("card-detail/");
}

/**
 * 경로별 처리 함수들
 */
async function handleInterestingRoute() {
  console.log("흥미로운 명함 화면으로 이동");
  router.replace("/received-interesting" as any);
}

async function handleNotesRoute(
  baseUrl: string,
  searchParams: URLSearchParams,
) {
  console.log("메모 화면으로 이동");

  if (baseUrl === "card-notes/detail") {
    const noteId = searchParams.get("noteId");
    const cardId = searchParams.get("cardId");

    if (noteId) {
      router.replace(
        `/card-notes/detail?noteId=${noteId}${cardId ? `&cardId=${cardId}` : ""}` as any,
      );
      console.log(`메모 상세 화면으로 이동: noteId=${noteId}`);
    } else {
      // noteId가 없으면 기본 메모 목록으로 이동
      console.log("메모 목록 화면으로 이동 (noteId 누락)");
    }
  } else {
    const cardId = searchParams.get("cardId");
    router.replace(`/card-notes${cardId ? `?cardId=${cardId}` : ""}` as any);
    console.log(`메모 목록 화면으로 이동${cardId ? `: cardId=${cardId}` : ""}`);
  }
}

async function handleCardShareRoute(
  baseUrl: string,
  searchParams: URLSearchParams,
  setCardId: (id: string | null) => void,
) {
  const cardId = baseUrl.replace("card-share/", "").split("/")[0];
  const shouldSave = searchParams.get("save") === "true";

  if (!cardId) return;

  console.log(`카드 공유 화면으로 이동: ${cardId}`);

  // Context에 cardId 저장
  setCardId(cardId);

  // 저장 파라미터가 있고 아직 저장하지 않은 카드인 경우에만 저장
  if (shouldSave && !savedCardIds.has(cardId)) {
    console.log(`카드 저장: ${cardId}`);
    savedCardIds.add(cardId);

    try {
      await saveCardToServer(cardId);
    } catch (error) {
      console.error("카드 저장 실패:", error);
      savedCardIds.delete(cardId);
    }
  }

  // 화면 이동
  router.replace(`/card-share/${cardId}` as any);
}

async function handleCardDetailRoute(
  baseUrl: string,
  searchParams: URLSearchParams,
  setCardId: (id: string | null) => void,
) {
  const cardId = baseUrl.replace("card-detail/", "").split("/")[0];

  if (!cardId) return;

  console.log(`카드 상세 화면으로 이동: ${cardId}`);

  // Context에 cardId 저장
  setCardId(cardId);

  // 화면 이동
  router.replace(`/card-detail/${cardId}` as any);
}
