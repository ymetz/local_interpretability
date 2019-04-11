import os, sys
from PIL import Image, ImageOps
import image_crawler
import shutil
import random
import tcav.utils as utils
import json
import os
import pickle
import image_crawler
from dataservice import get_model_list

'''
    Create all required folders to run TCAV experiments.
    It
        1. Creates all necessary directories
        2. Downloads images for concepts (crawls Google images, search term corresponds to concept name)
        3. Downloads random images and creates directories for as many random experiments as required


    If following the given dataset/model directory structure, tcav should run out of the box   
    After that, TCAV computation can be started with e.g. python run_tcav_1.py
'''


def rchop(string, ending):
    '''

    :param string:
    :param ending:
    :return:
    '''
    if string.endswith(ending):
        return string[:-len(ending)]
    return string


def crawl_and_process_concepts(concept_directory,
                               concepts,
                               random_counterparts,
                               nr_imgs_per_concept=50,
                               nr_random_images=500,
                               size=299):
    '''
        :param concept_directory:
        :param concepts:
        :param random_counterparts:
        :param nr_imgs_per_concept:
        :param nr_random_images:
        :param size:
        :return:
    '''

    # crawl images for concepts and target class
    for concept in concepts + random_counterparts:
        print("Crawl and process concept: ", concept)
        if not os.path.isdir(os.path.join(concept_directory, concept)):
            if not os.path.isdir(os.path.join(concept_directory, concept + "_before")):
                if concept in concepts:
                    image_crawler.crawl_images(concept_directory, concept, N=nr_imgs_per_concept)
                elif concept in random_counterparts:
                    image_crawler.crawl_images(concept_directory, concept, N=nr_random_images)
            in_dir = (os.path.join(concept_directory, concept + "_before"))

            os.makedirs(os.path.join(rchop(in_dir, "_before")))
            for infile in os.listdir(in_dir):
                if infile != '.DS_Store':
                    outfile = infile
                    im = Image.open(os.path.join(in_dir, infile))
                    if im.mode not in ('RGBA', 'LA', 'P'):
                        im = ImageOps.fit(im, (size, size), Image.ANTIALIAS, 0, (0.5, 0.5))
                        im.save(os.path.join(rchop(in_dir, "_before"), outfile), "JPEG")
            shutil.rmtree(in_dir, ignore_errors=True)


def create_tcav_dirs(dataset=None,
                     model=None,
                     concept_dir="datasets/tcav_concepts",
                     tcav_dir=None,
                     nr_of_random_experiments=12,
                     concepts=[],
                     nr_imgs_per_concept=50,
                     nr_random_images=500):


    # if no custom tcav dir is given, create one in the model directory
    if tcav_dir == None:
        tcav_dir = os.join(model.model_path, "tcav/")
    # where activations are stored (only if your act_gen_wrapper does so)
    activation_dir = os.path.join(tcav_dir, 'activations/')
    # where CAVs are stored.
    # You can say None if you don't wish to store any.
    cav_dir = os.path.join(tcav_dir, 'cavs/')

    utils.make_dir_if_not_exists(activation_dir)
    utils.make_dir_if_not_exists(cav_dir)

    # Folders that random iamges are stored in. These concept names are searched for Google image
    # crawling, so choosing general/random terms lead to wide variety of images without preference
    # for one concept
    random_counterparts = ['random_images', 'photo', 'image']

    crawl_and_process_concepts(concept_dir,
                               concepts,
                               random_counterparts,
                               nr_imgs_per_concept,
                               nr_random_images)

    '''
        Create directories for random experiments. For each tcav random experiement, we
        need on folder with random images. These directories are filled with 1/3 random
        images from the random_counterpart folder and 2/3 are sampled from all concept
        directories. This leads to random counterparts that do not favour one specific
        concept.
    '''
    # name schema of the random concept directories, 'random500_' is the default
    random_concept = "random500_"

    other_concept_file_list = []
    random_file_list = []

    for dir in os.walk(concept_dir):
        if dir[0] == concept_dir:
            continue
        if dir[0] in random_counterparts:
            random_file_list += [os.path.join(dir[0], b) for b in dir[2]]
        if "." in dir[0]:
            continue
        else:
            other_concept_file_list += [os.path.join(dir[0], b) for b in dir[2]]

    for index in range(0, nr_of_random_experiments):
        random_out_dir = os.path.join(concept_dir, random_concept + str(index))
        os.makedirs(random_out_dir)
        file_list = []
        file_list += random.sample(random_file_list, 33)
        file_list += random.sample(other_concept_file_list, 67)
        for infile in file_list:
            if infile != '.DS_Store':
                outfile = "-".join(infile.split("/")[2:])
                im = Image.open(os.path.join(infile))
                if im.mode not in ('RGBA', 'LA', 'P'):
                    im.save(os.path.join(random_out_dir, outfile), "JPEG")