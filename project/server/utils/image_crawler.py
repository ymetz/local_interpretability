import icrawler
import os

from icrawler.builtin import GoogleImageCrawler


def crawl_images(image_dir, concept_keyword, N=10):
    google_crawler = GoogleImageCrawler(
        storage={'root_dir': os.path.join(image_dir, concept_keyword+"_before")},
        feeder_threads=1,
        parser_threads=2,
        downloader_threads=4,
    )
    google_crawler.crawl(keyword=concept_keyword, max_num=N)

