import os


# base class for models
class ModelPrototype(object):

    def __init__(self, model_id, model_path, model_name):
        self.model_id = model_id
        self.model_path = model_path
        self.model_name = model_name
        self.logdir = os.path.join(model_path, 'logdir')

class KerasModel(ModelPrototype):

    def b(self):
        pass

