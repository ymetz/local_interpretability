import os
from model_handling.model import KerasModel
from model_handling.tensorflow_models import InceptionModel
from data_handling.dataset import ImageDataset, TextDataset
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
                        if file.endswith(('.JPEG', '.jpg', '.png')):
                            im = Image.open(dataset_path+"/"+file)
                            nr_images += 1
                            width, height = im.size
                            file_list.append({"src": file, "width": width, "height": height})
                    datasets.append(ImageDataset(dataset_id, dataset_path, subdir.split('_')[1], file_list, nr_images))
                    dataset_id = dataset_id + 1
                elif subdir.split('_')[0] == 'text':
                    datasets.append(TextDataset(dataset_id, dataset_path, subdir.split('_')[1]))
                    dataset_id = dataset_id + 1
                elif subdir == "tcav_concepts":
                    print("found concept directory for tcav")
                elif subdir == 'current_explanations':
                    print("found existing directory for explanation images. Images in the directory may be owerwritten.")
                else:
                    print("{0} is not a valid dataset directory".format(subdir))
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
            if not subdir.startswith('.') and not '__init__' in subdir:
                model_path = os.path.join(path, subdir)
                if subdir == 'preprocessing':
                    print('preprocessing directory found')
                elif subdir.split('_')[0] == 'keras':
                    models.append(KerasModel(model_id, model_path, subdir.split('_')[1]))
                elif subdir.split('_')[0] == 'tensorflow':
                    if subdir.split('_')[1] == 'inception':
                        models.append(InceptionModel(model_id, model_path, subdir.split('_')[1]))
                else:
                    raise Exception('Invalid or unsupported model found: {0} Check the name of the folder.'.format(subdir))
                model_id = model_id + 1
    except Exception as e:
        print(e)
    finally:
        return models

#returns dict of ten example images per concept
def get_tcav_example_images(path):
    concepts = {}
    for subdir in os.listdir(path):
        if not subdir.startswith('.') and not '__init__' in subdir:
            concepts[subdir] = []
            concept_dir_path = os.path.join(path, subdir)
            for file in os.listdir(concept_dir_path)[:10]:
                if file.endswith(('.JPEG', '.jpg', '.png')):
                    im = Image.open(os.path.join(concept_dir_path, file))
                    width, height = im.size
                    concepts[subdir].append({"src": os.path.join(subdir, file), "width": width, "height": height})
    return concepts


