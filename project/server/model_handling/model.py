import os
from abc import ABC, abstractmethod


# base class for models
class ModelPrototype(ABC):

    def __init__(self, model_id, model_path, model_name):
        self.model_id = model_id
        self.model_path = model_path
        self.model_name = model_name
        self.logdir = os.path.join(model_path, 'logdir')

    @abstractmethod
    def transform_images(self, path_list):
        pass

    @abstractmethod
    def predict_images(self, images):
        pass





class KerasModel(ModelPrototype):

    def b(self):
        pass

