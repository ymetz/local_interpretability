import os
import pickle

tcav1 = {}
tcav_2 = {}

with open('ILSVRC2012inception_v3-tcavscores-1.pkl', 'rb') as f:
    tcav_1 = pickle.load(f)
    print(tcav_1.keys())

with open('ILSVRC2012inception_v3-tcavscores-2.pkl', 'rb') as f:
    tcav_2 = pickle.load(f)
    print(tcav_2.keys())

with open('imagenetinception-tcavscores.pkl', 'rb') as f:
     tcav_3 = pickle.load(f)
     print(tcav_3.keys())

out_tcav = {**tcav_1, **tcav_2}
print(out_tcav.keys())

#with open('imagenetinception-tcavscores.pkl', 'wb') as f:
    #out_tcav = {**tcav_1, **tcav_2, **tcav_3}
    #pickle.dump(out_tcav, f)

