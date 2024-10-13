import numpy as np

#https://pdf.sciencedirectassets.com/280203/1-s2.0-S1877050921X0021X/1-s2.0-S1877050921025102/main.pdf?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGsaCXVzLWVhc3QtMSJIMEYCIQDWpkBIM9h0Ct3A%2FfXHCorWdf9Ek7WTquhTMlDoP%2Bs1%2FAIhAMnD2IbX%2BpM%2BsTiZwXN2wERdhE1M%2B96KVtStS5btCx1WKrwFCMT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQBRoMMDU5MDAzNTQ2ODY1IgwlV4uFAMqBDP0JyJsqkAVmjnZMuDxWbACmFsEA4N%2FdDn6NEpCV%2BG1S5sc2yE2zoJY5AXi9UKVNQjWPbPMHkOfuPIGz1mbCVknYXvSUfXsgnn6CyFY2IpldXnMDl4JapPlmv0Qe3uorFVqcd0N9IbTTHE%2FBmO%2FDMxV7AXGNxFPMo90U28CHYc4rs87YN0QriqBIcyQEKn2R1en%2FVyZ0yrq81Ue%2F7%2FpAXLdjYE3kYwp6U2ogqosggepmgMiZKLESurkCUDb4bhl3XjRsWACAsGXMub%2BRjKEpD%2FSYWvhv3VBlmmZ%2FYP6XebQNrbJcUPyHtOzkDICRAzK%2BSj4P%2BpJNqBb4Txqeq0joA2oW7qc7HhPkkWbRBA%2F2fdVdCsWXXryzxCNz74d%2Fj4hgUSt7vUwQycolgBdEvfa6LqC1CVtpcBTyKM0kbNSggtNYiKpfOSVG5jR9S7rS5v8FofMRetdcyJL47LpDugjxND3vhF1CZJABQVFJcCAM%2BR7vxs3oDT7nODhQGDHwzOjA7XftyaYbhJ2q%2FU3CIi%2B0M9u2U0otRMKrNNRhpXfFdb7ArEZjjjVTVZwKRNoAj5kcHexLRW9ztKM2MMlx48zzPkoBF%2FFjlo2Anhgb%2FLS3FagFJqNFZKvmUnqRnt7HhlltQCcDJMaMViNgBIwJ%2Bm7UT059G75prHgPlS11NrIEe7qir355dXSm%2BEnAT9jq4y5SVH9PjsvZ%2FpGAN3an5HVIsrJYW8OpdR0vJH55%2FJ2Wot9LqIa%2FZNTj8dYQrr0pbD1XnM33%2FShmpwKiYOJZ3I8q%2BpgCS7KM8xJx28QPjLhl4Njgeu4xg8bPU8CHPIC1aK4nHIuGhTEqBXAshs6OBZU7ijLMk3ONrR8tu4vaBmMWsu%2B1ci5%2BO3aiPDDbsrC4BjqwAYQL%2BIj%2FQ1gpTIkGgUMoCiWLvwHbNJXT6g6lyVEZC48IxWOklAgyxBz59S0xW9JgvOwOyOdrBrXcKT0CXZ5jZ50EkLdcL%2FYmYHAK8Yx%2B%2BzBu6P7E6rvLp1A7t4qeo9hiuOLGv5jVGVi4hLqtZtcUCzL6H9c7DslC2vbYCUEOxGcWmmQnP%2FJtJqONWFHNmjPz50H7At%2BtVQJ%2Bts1bCshD6hOw4Z%2BgwoCHbWM3gcQ9rhm3&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241013T195012Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ3PHCVTY2O6QBY6E%2F20241013%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1d42655eb650217ef7fa8ea02eaf1b9c5c69001d44444a6a798d16230dbf31bc&hash=fc3511f046c6fb78fc2813548f677a6e345aeaecdc3023f148a4a76d7fb53728&host=68042c943591013ac2b2430a89b270f6af2c76d8dfd086a07176afe7c76c2c61&pii=S1877050921025102&tid=spdf-59efdf17-f4ec-43a7-8131-3038a807dcc8&sid=c2ab49a65edd5347bb7b7528901033c048a6gxrqa&type=client&tsoh=d3d3LnNjaWVuY2VkaXJlY3QuY29t&ua=13135f03525e02035753&rr=8d21db74fd0d17f4&cc=us
class Solution:
    def __init__(self,A1,A2,A3,A4):
        #Ai=[x_Ai,y_Ai]
        #make sure they are np arrays
        self.A1=A1
        self.A2=A2
        self.A3=A3
        self.A4=A4
        self.k1 = np.sum(self.A1**2)
        self.k2 = np.sum(self.A2**2)
        self.k3 = np.sum(self.A3**2)
        self.k4 = np.sum(self.A4**2)
        self.createMatrixA()
        return 
    

    def createMatrixA(self):
        self.A = np.array([[0,0,0]]*3)
        self.A[0] = self.A2-self.A1
        self.A[1] = self.A3-self.A1
        self.A[2] = self.A4-self.A1
        return self.A
    
    def createMatrixB(self,R1,R2,R3,R4):
        R21 =R2-R1
        R31 =R3-R1
        R41 =R4-R1
        B = np.array([[-R21*R1 + 0.5*(self.k2-self.k1-R21)],
                      [-R31*R1 + 0.5*(self.k3-self.k1-R31)],
                      [-R41*R1 + 0.5*(self.k4-self.k1-R41)]])
        return B

    def findTagPosDirectMatrixMethod(self,R1,R2,R3,R4):
        X = np.linalg.inv(self.A)@self.createMatrixB(R1,R2,R3,R4)
        return X
    
    def findTagPosLeastSquareMethod(self,R1,R2,R3,R4):
        X = (np.linalg.inv((self.A.T)@self.A)@(self.A.T))@self.createMatrixB(R1,R2,R3,R4)
        return X