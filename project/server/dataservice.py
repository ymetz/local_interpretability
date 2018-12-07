import os
import fnmatch
from model import KerasModel
from tensorflow_models import InceptionModel
from dataset import ImageDataset, TextDataset
from PIL import Image

#returns list of available datasets
def get_dataset_list(path):
    datasets = []
    try:
        dataset_id = 0
        for subdir in os.listdir(path):
            if not subdir.startswith('.'):
                dataset_path = os.path.join(path, subdir)
                if subdir.split('_')[0] == 'image':
                    file_list = []
                    nr_images = 0
                    for file in os.listdir(dataset_path):
                        if file.endswith(('.JPEG','.jpg','.png')):
                            im = Image.open(dataset_path+"/"+file)
                            nr_images += 1
                            width, height = im.size
                            file_list.append({"src" : "/get_data/dataset/"+file, "width" : width, "height" : height})
                    datasets.append(ImageDataset(dataset_id, dataset_path, subdir.split('_')[1], file_list, nr_images))
                elif subdir.split('_')[0] == 'text':
                    datasets.append(TextDataset(dataset_id, dataset_path, subdir.split('_')[1]))
                else:
                    raise Exception('Invalid or unsupported dataset found. Check the name of the folder.')
                dataset_id = dataset_id + 1
    except Exception as e:
        print(e)
    finally:
        return datasets

#returns list of available models
def get_model_list(path):
    models = []
    try:
        model_id = 0
        for subdir in os.listdir(path):
            if not subdir.startswith('.'):
                model_path = os.path.join(path, subdir)
                if subdir == 'preprocessing':
                    print('preprocessing directory found')
                elif subdir.split('_')[0] == 'keras':
                    models.append(KerasModel(model_id, model_path, subdir.split('_')[1]))
                elif subdir.split('_')[0] == 'tensorflow':
                    if subdir.split('_')[1] == 'inception':
                        models.append(InceptionModel(model_id, model_path, subdir.split('_')[1]))
                else:
                    raise Exception('Invalid or unsupported model found. Check the name of the folder.')
                model_id = model_id + 1
    except Exception as e:
        print(e)
    finally:
        return models

#get preview thumbnail for list of images
def get_thumbnails( model, image_list ):
    return []

#get image in original resolution by id
def get_original_image( model, image_id ):
    return None

#return the lrp result image of a specific image id
def get_lrp( model, image_id ):
    return None

#return the lime result image of specified image id
def get_lime( model, image_id ):
    return None

#return image input + edge detection
def get_edge_image( image_id ):
    return None



