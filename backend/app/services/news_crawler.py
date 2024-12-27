import logging
from scrapy.crawler import CrawlerRunner
from scrapy import Spider, Request, signals
from scrapy.signalmanager import dispatcher
from twisted.internet import reactor, defer
from datetime import datetime, timedelta
import re

# 로거 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NaverNewsSpider(Spider):
    name = "naver_news"
    allowed_domains = ["search.naver.com"]

    def __init__(self, category, limit, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.category = category
        self.limit = limit
        self.start_urls = [
            f"https://search.naver.com/search.naver?where=news&query={category}"
        ]
        self.total_fetched = 0

    def parse(self, response):
        logger.info(f"Parsing page: {response.url}")
        for item in response.css(".news_wrap"):
            title = item.css(".news_tit::attr(title)").get()
            url = item.css(".news_tit::attr(href)").get()
            description = item.css(".dsc_wrap").xpath("normalize-space()").get()
            source = item.css(".info_group .info::text").get()
            published_at = self.extract_published_date(item)

            yield {
                "title": title,
                "url": url,
                "description": description,
                "source": source,
                "published_at": published_at,
            }

            self.total_fetched += 1
            if self.total_fetched >= self.limit:
                logger.info(f"Reached limit of {self.limit} articles.")
                return

        next_page = response.css(".sc_page_inner a.next::attr(href)").get()
        if next_page and self.total_fetched < self.limit:
            logger.info(f"Moving to next page: {response.urljoin(next_page)}")
            yield Request(response.urljoin(next_page), callback=self.parse)

    def extract_published_date(self, item):
        now = datetime.now()
        for element in item.css(".info_group .info"):
            date_text = element.css("::text").get()
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
            if re.match(r"\d{4}\.\d{2}\.\d{2}\.", date_text):
                return datetime.strptime(date_text, "%Y.%m.%d.").strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
        return None


def crawl_news_from_naver(category: str, limit: int = 10):
    """
    Scrapy를 사용하여 동기적으로 뉴스를 크롤링합니다.
    """
    logger.info(f"Starting crawl for category: {category}, limit: {limit}")
    runner = CrawlerRunner()
    items_collected = []

    # 데이터를 수집하는 신호 설정
    def collect_items(item, response, spider):
        items_collected.append(item)

    # 신호 연결
    dispatcher.connect(collect_items, signal=signals.item_scraped)

    deferred = runner.crawl(NaverNewsSpider, category=category, limit=limit)
    deferred.addBoth(lambda _: reactor.stop())

    # Twisted 이벤트 루프 실행
    reactor.run()
    logger.info(f"Crawling finished for category: {category}")

    # 크롤링된 데이터 반환
    return items_collected
