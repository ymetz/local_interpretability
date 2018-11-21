import os


# base class for datasets: a dataset always consists of a dataset and an assosiated dataset
class DatasetPrototype(object):

    def __init__(self, dataset_id, dataset_path, dataset_name, num_elements):
        self.dataset_id = dataset_id
        self.dataset_path = dataset_path
        self.dataset_name = dataset_name
        self.num_elements = num_elements

    # returns a summary statistics of an available dataset
    def get_dataset_summary(dataset_id):
        pass

    # get summary statistics of available dataset
    def get_dataset_summary(dataset_id):
        pass

    # get single_elements of the dataset
    def get_dataset_elements(dataset_id):
        pass


class ImageDataset(DatasetPrototype):

    def a(self):
        pass
    def __init__(self, *args, **kwargs):
        super(ImageDataset, self).__init__(*args, **kwargs)
        self.labels = os.path.join(self.dataset_path, 'labels')


class TextDataset(DatasetPrototype):

    def b(self):
        pass

