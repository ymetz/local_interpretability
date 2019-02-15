import os


# base class for models: a model always consists of a model and an assosiated dataset
class ModelPrototype(object):

    def __init__(self, model_id, model_path, model_name):
        self.model_id = model_id
        self.model_path = model_path
        self.model_name = model_name
        self.logdir = os.path.join(model_path, 'logdir')

    # returns a summary statistics of an available model
    def get_model_summary(model_id):
        pass

    # get summary statistics of available dataset
    def get_dataset_summary(model_id):
        pass

    # get single_elements of the dataset
    def get_dataset_elements(model_id):
        pass

class KerasModel(ModelPrototype):

    def b(self):
        pass

