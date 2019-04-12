import os
import json
from abc import ABC

'''
    dataset.py
    base class for datasets: a dataset always consists of a dataset and an assosiated dataset
'''


class DatasetPrototype(ABC):

    def __init__(self, dataset_id, dataset_path, dataset_name, file_list, num_elements):
        self.dataset_id = dataset_id
        self.dataset_type = 'unknown'
        self.dataset_path = dataset_path
        self.dataset_name = dataset_name
        self.file_list = file_list
        self.num_elements = num_elements


class ImageDataset(DatasetPrototype):

    def __init__(self, *args, **kwargs):
        super(ImageDataset, self).__init__(*args, **kwargs)
        self.label_path = os.path.join(self.dataset_path, 'labels.json')
        self.id_to_label_path = os.path.join(self.dataset_path, 'id_to_label.json')
        self.dataset_type = 'image'

        with open(self.label_path) as lf:
            self.labels = json.load(lf)
        self.label_to_elements = {}
        for item in self.labels.items():
            if item[1][0] not in self.label_to_elements.keys():
                self.label_to_elements[item[1][0]] = []
            self.label_to_elements[item[1][0]].append(item[0])
        with open(self.id_to_label_path) as ifile:
            self.id_to_label = json.load(ifile, object_hook=jsonKeys2int)
            self.num_of_labels = len(self.id_to_label)


class TextDataset(DatasetPrototype):

    def __init__(self, *args, **kwargs):
        super(TextDataset, self).__init__(*args, **kwargs)
        self.dataset_type = 'text'


class TabularDataset(DatasetPrototype):

    def __init__(self, *args, **kwargs):
        super(TabularDataset, self).__init__(*args, **kwargs)
        self.dataset_type = 'tabular'


def encode_dataset(ds):
    if isinstance(ds, DatasetPrototype):
        ds_dict = {}
        ds_dict['id'] = ds.dataset_id
        ds_dict['dataset_name'] = ds.dataset_name
        ds_dict['dataset_path'] = ds.dataset_path
        ds_dict['num_elements'] = ds.num_elements
        ds_dict['dataset_type'] = ds.dataset_type
        return ds_dict
    else:
        type_name = ds.__class__.__name__
        raise TypeError(f"Object of type '{type_name}' is not JSON serializable")


def jsonKeys2int(x):
    if isinstance(x, dict):
        return {int(k): v for k, v in x.items()}
    return x
