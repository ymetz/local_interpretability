import os, sys
from utils import image_crawler
from PIL import Image, ImageOps
import shutil

size = 399

def rchop(string, ending):
  if string.endswith(ending):
    return string[:-len(ending)]
  return string

concept_directory = "../../../datasets/tcav_concepts"

# concepts = ["smooth texture", "gradient", "dotted", "striped", "zigzagged", "chaos texture", "noise texture",
#             "random pattern", "colorful", "single color", "monochrome", "photo", "drawing", "employee", "leisure", "man",
#             "woman", "child", "animal", "land animal", "water animal",
#             "bird", "wood", "metal material", "plastic", "concrete", "food", "tool", "furniture", "abstract"]

concepts = ["glossy surface", "matt surface", "uneven texture", "wrinkled object", "rectangle pattern", "transparent object",
            "translucent", "rectangular", "round", "triangular", "complex shape", "spiky surface", "tree", "flower",
            "plant", "grass/moss", "machine", "machine device", "architecture", "clothes", "animal fur", "fabric clothes",
            "inside lighting", "nature", "beach", "underwater", "sky"]

# random_concepts = ["random"]


random_directories = ["random500_0", "random500_1", "random500_2", "random500_3", "random500_4"]

def crawl_and_process_concepts():
    # crawl images for concepts and target class
    for concept in concepts:
        print(concept)
        if not os.path.isdir(os.path.join(concept_directory, concept)):
            if not os.path.isdir(os.path.join(concept_directory, concept+"_before")):
                image_crawler.crawl_images(concept_directory, concept, N=100)
            in_dir = (os.path.join(concept_directory, concept+"_before"))

            os.makedirs(os.path.join(rchop(in_dir, "_before")))
            for infile in os.listdir(in_dir):
                if infile != '.DS_Store':
                    outfile = infile
                    im = Image.open(os.path.join(in_dir, infile))
                    if im.mode not in ('RGBA', 'LA', 'P'):
                        im = ImageOps.fit(im, (size, size), Image.ANTIALIAS, 0, (0.5, 0.5))
                        im.save(os.path.join(rchop(in_dir, "_before"), outfile), "JPEG")
            shutil.rmtree(in_dir, ignore_errors=True)


def process_random():
    for random in random_directories:
            os.makedirs(os.path.join(concept_directory, random+"_processed"))
            in_dir = os.path.join(concept_directory, random)
            for infile in os.listdir(in_dir):
                if infile != '.DS_Store':
                    outfile = infile
                    im = Image.open(os.path.join(in_dir, infile))
                    if im.mode not in ('RGBA', 'LA', 'P'):
                        im = ImageOps.fit(im, (size, size), Image.ANTIALIAS, 0, (0.5, 0.5))
                        im.save(os.path.join(in_dir+"_processed", outfile), "JPEG")
            shutil.rmtree(in_dir, ignore_errors=True)


crawl_and_process_concepts()
# process_random()
