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


def encode_dataset(ds):
    if isinstance(ds, DatasetPrototype):
        ds_dict = {}
        ds_dict['id'] = ds.dataset_id
        ds_dict['dataset_name'] = ds.dataset_name
        ds_dict['dataset_path'] = ds.dataset_path
        ds_dict['num_elements'] = ds.num_elements
        return ds_dict
    else:
        type_name = ds.__class__.__name__
        raise TypeError(f"Object of type '{type_name}' is not JSON serializable")

