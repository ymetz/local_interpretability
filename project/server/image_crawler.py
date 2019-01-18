import icrawler
import os

from icrawler.builtin import GoogleImageCrawler


def crawl_images(image_dir, concept_keyword):
    google_crawler = GoogleImageCrawler(storage={'root_dir': os.path.join(image_dir, concept_keyword)})
    google_crawler.crawl(keyword=concept_keyword, max_num=10)
