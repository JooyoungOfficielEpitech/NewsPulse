import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import re


def crawl_news_from_naver(keyword: str, limit: int = 10):
    """
    네이버 뉴스에서 키워드로 검색된 결과를 크롤링합니다. 여러 페이지를 탐색합니다.

    Args:
        keyword (str): 검색할 키워드.
        limit (int): 가져올 뉴스 기사의 최대 수.

    Returns:
        list: 크롤링된 뉴스 기사 목록.
    """
    base_url = "https://search.naver.com/search.naver"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/108.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://search.naver.com",
    }

    articles = []
    page = 1
    articles_per_page = 10  # 네이버 뉴스는 한 페이지당 10개의 결과를 보여줍니다.

    while len(articles) < limit:
        params = {
            "query": keyword,
            "where": "news",
            "start": (page - 1) * articles_per_page + 1,  # 페이지 계산
        }
        try:

            response = requests.get(
                base_url, params=params, headers=headers, timeout=10
            )

            # HTTP 상태 코드 확인
            if response.status_code == 403:
                print(response.text)
                log_crawling_error(keyword, response.status_code, "Access Denied")
                break
            elif response.status_code != 200:
                log_crawling_error(keyword, response.status_code, "Unexpected Error")
                break

            soup = BeautifulSoup(response.text, "html.parser")
            news_items = soup.select(".news_wrap")

            # 더 이상 결과가 없는 경우 루프 종료
            if not news_items:
                break

            for item in news_items:
                title = item.select_one(".news_tit").get("title", "")
                url = item.select_one(".news_tit").get("href", "")
                description = item.select_one(".dsc_wrap").text.strip()
                published_at = extract_published_date(item)  # 날짜 추출 로직
                articles.append(
                    {
                        "title": title,
                        "description": description,
                        "url": url,
                        "published_at": published_at,
                        "source": extract_source(item),
                        "category": keyword,
                    }
                )

                if len(articles) >= limit:
                    break

            page += 1
            time.sleep(1)  # 요청 간 딜레이 추가

        except requests.exceptions.RequestException as e:
            log_crawling_error(keyword, None, f"Request failed: {e}")
            break

    return articles


def extract_source(item):
    try:
        # 날짜 정보가 포함된 <span class="info"> 태그 선택
        date_text = item.select_one(".info_group .info").text.strip()

        return date_text

    except Exception as e:
        print(f"Error extracting source: {e}")

    return None


def log_crawling_error(keyword, status_code, message):
    """
    크롤링 중 발생한 오류를 로깅합니다.

    Args:
        keyword (str): 검색 키워드.
        status_code (int): HTTP 상태 코드.
        message (str): 오류 메시지.
    """
    error_message = f"Error crawling for keyword '{keyword}': {message}"
    if status_code:
        error_message += f" (HTTP {status_code})"
    print(error_message)


def extract_published_date(item):
    """
    뉴스 기사의 게시 날짜를 추출합니다.

    Args:
        item (BeautifulSoup element): 크롤링된 뉴스 아이템.

    Returns:
        str: 게시 날짜를 'YYYY-MM-DD HH:MM:SS' 형식으로 반환. 추출 실패 시 None 반환.
    """
    try:
        # info_group 내의 모든 info 태그 추출
        info_elements = item.select(".info_group .info")
        now = datetime.now()

        for element in info_elements:
            date_text = element.text.strip()

            # 상대 시간 처리 (예: "1일 전", "3시간 전")
            if "전" in date_text:
                if "분" in date_text:
                    delta = int(re.search(r"\d+", date_text).group())
                    return (now - timedelta(minutes=delta)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                elif "시간" in date_text:
                    delta = int(re.search(r"\d+", date_text).group())
                    return (now - timedelta(hours=delta)).strftime("%Y-%m-%d %H:%M:%S")
                elif "일" in date_text:
                    delta = int(re.search(r"\d+", date_text).group())
                    return (now - timedelta(days=delta)).strftime("%Y-%m-%d %H:%M:%S")

            # 절대 시간 처리 (예: "2024.12.03.")
            if re.match(r"\d{4}\.\d{2}\.\d{2}\.", date_text):
                return datetime.strptime(date_text, "%Y.%m.%d.").strftime(
                    "%Y-%m-%d %H:%M:%S"
                )

    except Exception as e:
        print(f"Error extracting date: {e}")

    return None
