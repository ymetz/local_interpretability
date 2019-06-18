import os
import pickle

tcav1 = {}
tcav_2 = {}

with open('/Users/yannick/Documents/Studium/interVis/models/tensorflow_inception_v3/imagenetinception-tcavscores.pkl', 'rb') as f:
    tcav_1 = pickle.load(f)
    print(tcav_1.keys())

with open('/Users/yannick/Documents/Studium/interVis/models/tensorflow_inception_v3/ILSVRC2012inception_v3-tcavscores-2.pkl', 'rb') as f:
    tcav_2 = pickle.load(f)
    print(tcav_2.keys())
    print(tcav_2)


out_tcav = {**tcav_1, **tcav_2}
print(out_tcav)


#with open('/Users/yannick/Documents/Studium/interVis/models/tensorflow_inception_v3/NEW_ILSVRC2012inception_v3-tcavscores.pkl', 'wb') as f:
#    pickle.dump(out_tcav, f)
