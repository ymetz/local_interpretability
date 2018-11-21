import os
import json


# base class for datasets: a dataset always consists of a dataset and an assosiated dataset
class DatasetPrototype(object):

    def __init__(self, dataset_id, dataset_path, dataset_name, file_list, num_elements):
        self.dataset_id = dataset_id
        self.dataset_path = dataset_path
        self.dataset_name = dataset_name
        self.file_list = file_list
        self.num_elements = num_elements


class ImageDataset(DatasetPrototype):

    def __init__(self, *args, **kwargs):
        super(ImageDataset, self).__init__(*args, **kwargs)
        self.label_path = os.path.join(self.dataset_path, 'labels.json')

        with open(self.label_path) as lf:
            self.labels = json.load(lf)


class TextDataset(DatasetPrototype):

    def b(self):
        pass

